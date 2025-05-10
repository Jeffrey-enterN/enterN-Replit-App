import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { USER_TYPES } from "../shared/schema";
import { setupMatchRoutes } from "./routes-match";
import { setupCompanyRoutes } from "./routes-updates";
import { WebSocketServer } from 'ws';
import { Router } from "express";
import { scrapeCompanyWebsite } from "./utils/website-scraper";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes
  setupAuth(app);
  
  // Set up a single router for all our API routes
  const router = Router();
  
  // Set up company routes from routes-updates.ts
  setupCompanyRoutes(router);
  
  // Set up match routes for swipe-to-match functionality
  setupMatchRoutes(router);
  
  // Use the router in our app
  app.use(router);
  
  // Test routes for system status and diagnostics
  app.get("/api/test", (req, res) => {
    res.status(200).json({
      message: "API is working",
      timestamp: new Date().toISOString(),
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated()
    });
  });
  
  // Database migration endpoint (for development use)
  app.post("/api/admin/db/migrate", async (req, res) => {
    try {
      // Check if the request has a secret key matching DB_ADMIN_KEY
      // This is a basic protection to prevent unauthorized schema updates
      if (req.body.key !== 'enterN-admin-secret-key') {
        return res.status(403).json({ 
          error: "Unauthorized", 
          message: "Valid admin key required for database operations" 
        });
      }
      
      // Check if a specific migration was requested
      if (req.body.migration === 'job-interests') {
        try {
          // Import the database client
          const { db } = await import("./db");
          
          // Check if job_interests table exists
          const checkTableExists = await db.execute(`
            SELECT tablename 
            FROM pg_catalog.pg_tables
            WHERE tablename = 'job_interests'
          `);
          
          if (checkTableExists.rows.length === 0) {
            console.log('Creating job_interests table...');
            
            // Create the job_interests table
            await db.execute(`
              CREATE TABLE IF NOT EXISTS job_interests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                jobseeker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
                interested BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(jobseeker_id, job_posting_id)
              );
            `);
            
            console.log('Successfully created job_interests table');
            
            return res.status(200).json({ 
              success: true, 
              message: "Created job_interests table",
              migration: "job-interests"
            });
          } else {
            return res.status(200).json({ 
              success: true, 
              message: "job_interests table already exists",
              migration: "job-interests" 
            });
          }
        } catch (error) {
          console.error("job-interests migration error:", error);
          return res.status(500).json({ 
            error: "Migration failed", 
            message: (error as Error).message,
            migration: "job-interests"
          });
        }
      }
      
      if (req.body.migration === 'swiped_by') {
        try {
          // Import the database client
          const { db } = await import("./db");
          
          // Check if the column already exists
          const checkColumnExists = await db.execute(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'swipes' AND column_name = 'swiped_by'
          `);
          
          if (checkColumnExists.rows.length === 0) {
            console.log('Adding swiped_by column to swipes table');
            
            // Drop existing constraint if it exists
            try {
              await db.execute(`
                ALTER TABLE swipes 
                DROP CONSTRAINT IF EXISTS swipes_jobseeker_id_employer_id_direction_unique
              `);
              console.log('Dropped existing constraint');
            } catch (error) {
              console.log('No constraint to drop or error dropping constraint:', error.message);
            }
            
            // Add the swipedBy column
            await db.execute(`
              ALTER TABLE swipes 
              ADD COLUMN swiped_by VARCHAR(20) NOT NULL DEFAULT 'employer'
            `);
            console.log('Added swiped_by column');
            
            // Set all existing records to 'employer' as the default swipedBy value
            await db.execute(`
              UPDATE swipes 
              SET swiped_by = 'employer'
            `);
            console.log('Updated existing records with default values');
            
            // Create new unique constraint including swipedBy
            await db.execute(`
              ALTER TABLE swipes 
              ADD CONSTRAINT swipes_jobseeker_id_employer_id_swiped_by_unique 
              UNIQUE (jobseeker_id, employer_id, swiped_by)
            `);
            console.log('Added new constraint with swiped_by column');
            
            return res.status(200).json({ 
              success: true, 
              message: "Added swiped_by column to swipes table",
              migration: "swiped_by"
            });
          } else {
            return res.status(200).json({ 
              success: true, 
              message: "swiped_by column already exists",
              migration: "swiped_by" 
            });
          }
        } catch (error) {
          console.error("swiped_by migration error:", error);
          return res.status(500).json({ 
            error: "Migration failed", 
            message: (error as Error).message,
            migration: "swiped_by"
          });
        }
      }

      // Import the database client
      const { db } = await import("./db");
      
      // Get the current schema object
      const { swipes, matches } = await import("../shared/schema");
      
      // Special migration: Add companyId, direction and jobPostingId to swipes table if not exists
      try {
        // Check if table exists and if columns need to be added
        const tableInfo = await db.execute(`
          SELECT 
            column_name
          FROM 
            information_schema.columns
          WHERE 
            table_name = 'swipes'
        `);
        
        const columns = tableInfo.rows.map(r => r.column_name);
        
        // If direction column doesn't exist, add it
        if (!columns.includes('direction')) {
          await db.execute(`
            ALTER TABLE swipes
            ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'jobseeker-to-employer'
          `);
          console.log("Added 'direction' column to swipes table");
        }
        
        // If companyId column doesn't exist, add it
        if (!columns.includes('company_id')) {
          await db.execute(`
            ALTER TABLE swipes
            ADD COLUMN "company_id" INTEGER REFERENCES "companies"("id") ON DELETE CASCADE
          `);
          console.log("Added 'company_id' column to swipes table");
        }
        
        // If jobPostingId column doesn't exist, add it
        if (!columns.includes('job_posting_id')) {
          await db.execute(`
            ALTER TABLE swipes
            ADD COLUMN "job_posting_id" UUID REFERENCES "job_postings"("id") ON DELETE SET NULL
          `);
          console.log("Added 'job_posting_id' column to swipes table");
        }
        
        // Check for uniqueness constraint
        const constraints = await db.execute(`
          SELECT 
            constraint_name
          FROM 
            information_schema.table_constraints
          WHERE 
            table_name = 'swipes' AND
            constraint_type = 'UNIQUE'
        `);
        
        const constraintNames = constraints.rows.map(r => r.constraint_name);
        
        if (!constraintNames.includes('swipes_jobseeker_id_employer_id_direction_unique')) {
          await db.execute(`
            ALTER TABLE swipes
            ADD CONSTRAINT swipes_jobseeker_id_employer_id_direction_unique
            UNIQUE (jobseeker_id, employer_id, direction)
          `);
          console.log("Added uniqueness constraint to swipes table");
        }
        
        // Also update matches table if needed
        const matchesTableInfo = await db.execute(`
          SELECT 
            column_name
          FROM 
            information_schema.columns
          WHERE 
            table_name = 'matches'
        `);
        
        const matchesColumns = matchesTableInfo.rows.map(r => r.column_name);
        
        // If companyId column doesn't exist in matches, add it
        if (!matchesColumns.includes('company_id')) {
          await db.execute(`
            ALTER TABLE matches
            ADD COLUMN "company_id" INTEGER REFERENCES "companies"("id") ON DELETE CASCADE
          `);
          console.log("Added 'company_id' column to matches table");
        }
        
        // If lastActivityAt column doesn't exist in matches, add it
        if (!matchesColumns.includes('last_activity_at')) {
          await db.execute(`
            ALTER TABLE matches
            ADD COLUMN "last_activity_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          `);
          console.log("Added 'last_activity_at' column to matches table");
        }
        
        return res.status(200).json({ 
          success: true, 
          message: "Database schema updated successfully"
        });
      } catch (error) {
        console.error("Migration error:", error);
        return res.status(500).json({ 
          error: "Migration failed", 
          message: (error as Error).message
        });
      }
    } catch (error) {
      return res.status(500).json({ 
        error: "Server error", 
        message: (error as Error).message
      });
    }
  });
  
  // Test route for company draft system
  app.get("/api/test/company-draft", async (req, res) => {
    try {
      const { db } = await import("./db");
      
      // Query the database directly with regular SQL query (not using sql template)
      const result = await db.execute(`
        SELECT id, user_id, company_id, step, draft_type, last_active, created_at, updated_at
        FROM company_profile_drafts
      `);
      
      res.status(200).json({
        message: "Draft system test succeeded",
        drafts: result.rows || [],
        schema: {
          columns: [
            "id", "user_id", "company_id", "draft_data", "step", 
            "draft_type", "last_active", "created_at", "updated_at"
          ],
          constraints: [
            "company_profile_drafts_pkey (PRIMARY KEY on id)",
            "company_profile_drafts_user_id_company_id_unique (UNIQUE on user_id, company_id)",
            "company_profile_drafts_user_id_fkey (FOREIGN KEY from user_id to users.id)",
            "company_profile_drafts_company_id_fkey (FOREIGN KEY from company_id to companies.id)"
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in draft test endpoint:", error);
      res.status(500).json({
        message: "Error testing draft system",
        error: (error as Error).message
      });
    }
  });

  // === Jobseeker Routes ===
  
  // Create/Update Jobseeker Profile
  app.post("/api/jobseeker/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      const jobseekerProfile = await storage.createJobseekerProfile(req.user.id, req.body);
      res.status(200).json(jobseekerProfile);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Save Jobseeker Profile Draft
  app.post("/api/jobseeker/profile/draft", async (req, res) => {
    console.log("Profile draft save attempt - isAuthenticated:", req.isAuthenticated());
    console.log("Session data:", { 
      id: req.sessionID, 
      cookie: req.session?.cookie, 
      user: req.user ? { id: req.user.id, username: req.user.username } : undefined 
    });
    
    // Add detailed request info for iOS debugging
    console.log("Request headers:", {
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    if (!req.isAuthenticated()) {
      console.log("Unauthorized attempt to save profile draft - session info:", 
                 { sessionID: req.sessionID, user: req.user });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    console.log("Authenticated user saving profile draft:", req.user.id, req.user.username);
    
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      console.log("Forbidden attempt - user is not a jobseeker:", req.user.userType);
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      // Log payload size for debugging
      console.log("Profile draft data size:", JSON.stringify(req.body).length, "bytes");
      
      const profileDraft = await storage.saveJobseekerProfileDraft(req.user.id, req.body);
      console.log("Profile draft saved successfully for user:", req.user.id);
      
      // Send more verbose success response with timestamp
      res.status(200).json({
        ...profileDraft,
        _meta: {
          savedAt: new Date().toISOString(),
          message: "Profile draft saved successfully"
        }
      });
    } catch (error) {
      console.error("Error saving profile draft:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Jobseeker Dashboard Data
  // Get Jobseeker Profile
  app.get("/api/jobseeker/profile", async (req, res) => {
    console.log("Profile fetch attempt - isAuthenticated:", req.isAuthenticated());
    console.log("Session data:", { 
      id: req.sessionID, 
      cookie: req.session?.cookie, 
      user: req.user ? { id: req.user.id, username: req.user.username } : undefined 
    });
    
    // Add detailed request info for iOS debugging
    console.log("Request headers:", {
      userAgent: req.headers['user-agent'],
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    if (!req.isAuthenticated()) {
      console.log("Unauthorized attempt to fetch profile - session info:", 
                 { sessionID: req.sessionID, user: req.user });
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    console.log("Authenticated user fetching profile:", req.user.id, req.user.username);
    
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      console.log("Forbidden attempt - user is not a jobseeker:", req.user.userType);
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      // First check if there's a completed profile
      const profile = await storage.getJobseekerProfile(req.user.id);
      
      // Then also check if there's a draft version to merge in
      const profileDraft = await storage.getJobseekerProfileDraft(req.user.id);
      
      // Merge draft with profile if both exist, preferring draft values when available
      let responseData;
      
      if (profile && profileDraft) {
        // If we have both a profile and a draft, merge them prioritizing draft values
        console.log("Found both profile and draft for user:", req.user.id);
        
        // Merge the objects, giving priority to draft values
        responseData = {
          ...profile,
          ...profileDraft, // Draft values overwrite profile values
          _meta: {
            fetchedAt: new Date().toISOString(),
            userId: req.user.id,
            hasDraft: true,
            source: "merged"
          }
        };
      } else if (profile) {
        // Only have the profile
        console.log("Profile found and returned for user:", req.user.id);
        responseData = {
          ...profile,
          _meta: {
            fetchedAt: new Date().toISOString(),
            userId: req.user.id,
            hasDraft: false,
            source: "profile"
          }
        };
      } else if (profileDraft) {
        // Only have a draft
        console.log("Draft found and returned for user:", req.user.id);
        responseData = {
          ...profileDraft,
          _meta: {
            fetchedAt: new Date().toISOString(),
            userId: req.user.id,
            hasDraft: true,
            source: "draft"
          }
        };
      } else {
        // No profile or draft found
        console.log("No profile or draft found for user:", req.user.id);
        return res.status(404).json({ 
          message: "Profile not found",
          _meta: {
            userId: req.user.id,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Send the response data
      res.status(200).json(responseData);
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ 
        message: (error as Error).message,
        _meta: {
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  app.get("/api/jobseeker/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      const dashboardData = await storage.getJobseekerDashboard(req.user.id);
      res.status(200).json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Potential Matches for Jobseeker
  app.get("/api/jobseeker/matches/potential", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      console.log(`Fetching potential matches for jobseeker ${req.user.id} (${req.user.username})`);
      
      try {
        // Import required components for direct DB access
        const { db } = await import("./db");
        const { users, swipes } = await import("../shared/schema");
        const { eq, and } = await import("drizzle-orm");
        
        // Special debug endpoint to check the exact issue with hr@enter-n.com not appearing
        const hrUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, 'hr@enter-n.com'));
          
        console.log(`HR users found: ${hrUsers.length}`);
        if (hrUsers.length > 0) {
          const hrUser = hrUsers[0];
          console.log('HR user found:', JSON.stringify(hrUser));
          
          // Check if they have a company
          const { companies } = await import("../shared/schema");
          // Check if the HR user's companyId exists and look it up
          if (hrUser.companyId) {
            const companyResults = await db
              .select()
              .from(companies)
              .where(eq(companies.id, hrUser.companyId));
              
            console.log(`Company found for HR user: ${companyResults.length}`);
            if (companyResults.length > 0) {
              console.log('Company details:', JSON.stringify(companyResults[0]));
              
              // The issue might be that we have a company but not an employer profile
              console.log('The HR user has a company but not an employer profile');
            }
          } else {
            console.log('HR user does not have a companyId assigned');
          }
          
          // Check company profile drafts
          const query = await db.execute(sql`
            SELECT * FROM company_profile_drafts 
            WHERE user_id = ${hrUser.id}
            ORDER BY updated_at DESC
          `);
          
          console.log(`Company profile drafts found: ${query.rows.length}`);
          if (query.rows.length > 0) {
            console.log('Latest draft:', JSON.stringify(query.rows[0]));
          }
          
          // Check if the company already exists
          if (hrUser.companyId) {
            console.log('HR user already has a company profile with ID:', hrUser.companyId);
          } else {
            console.log('HR user does not have a company profile');
            console.log('Creating a company profile for the HR user...');
            
            // Create a company profile for the HR user
            try {
              const companyData = {
                name: "enterN Inc.",
                size: "51-200",
                industries: ["Software & Technology"],
                headquarters: "Peoria, IL",
                yearFounded: "2024",
                about: "enterN helps early-career talent match with employers",
                mission: "enterN is changing the way companies connect with early-career talent through AI-driven matching algorithms that focus on company culture fit and values alignment rather than just resumes and keywords."
              };
              
              const { companies } = await import("../shared/schema");
              const newCompany = await db.insert(companies).values({
                ...companyData,
                createdAt: new Date(),
                updatedAt: new Date()
              }).returning();
              
              // Update the user to link to the company
              if (newCompany.length > 0) {
                await db.update(users)
                  .set({
                    companyId: newCompany[0].id,
                    companyRole: 'admin',
                    updatedAt: new Date()
                  })
                  .where(eq(users.id, hrUser.id));
                  
                console.log('Created company profile for HR user:', JSON.stringify(newCompany[0]));
              }
            } catch (profileError) {
              console.error('Error creating company profile for HR user:', profileError);
            }
          }
          
          // Check if there are swipes between this jobseeker and the HR employer
          const existingSwipes = await db
            .select()
            .from(swipes)
            .where(
              and(
                eq(swipes.jobseekerId, req.user.id),
                eq(swipes.employerId, hrUser.id)
              )
            );
          
          console.log(`Existing swipes between jobseeker ${req.user.id} and HR employer: ${existingSwipes.length}`);
          console.log('Swipe details:', JSON.stringify(existingSwipes));
          
          // If there are no swipes, this profile should appear in potential matches
          if (existingSwipes.length === 0) {
            console.log('No swipes found - HR employer should appear in potential matches');
          }
        } else {
          console.log('HR user (hr@enter-n.com) not found in the database');
        }
      } catch (debugError) {
        console.error('Error in debug code:', debugError);
      }
      
      const potentialMatches = await storage.getJobseekerPotentialMatches(req.user.id);
      console.log(`Found ${potentialMatches.length} potential matches for jobseeker ${req.user.id}`);
      res.status(200).json(potentialMatches);
    } catch (error) {
      console.error('Error getting jobseeker potential matches:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Handle Jobseeker Swipe Action
  app.post("/api/jobseeker/swipe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    const { employerId, interested } = req.body;
    if (!employerId) return res.status(400).json({ message: "Employer ID is required" });

    try {
      const result = await storage.handleJobseekerSwipe(req.user.id, employerId, interested);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Recent Matches for Jobseeker
  app.get("/api/jobseeker/matches/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      const recentMatches = await storage.getJobseekerRecentMatches(req.user.id);
      res.status(200).json(recentMatches);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Admin endpoint to get all job postings
  app.get("/api/admin/jobs", async (req, res) => {
    try {
      // Check if the request has a secret key matching DB_ADMIN_KEY
      if (req.query.key !== 'enterN-admin-secret-key') {
        return res.status(403).json({ 
          error: "Unauthorized", 
          message: "Valid admin key required for admin operations" 
        });
      }
      
      console.log("Fetching all jobs via admin endpoint");
      
      // Get all job postings
      const jobPostings = await storage.getAllJobPostings();
      
      // Get company info for each job
      const jobsWithCompanyInfo = await Promise.all(jobPostings.map(async (job) => {
        const company = job.companyId ? await storage.getCompany(job.companyId) : null;
        
        return {
          id: job.id,
          title: job.title,
          companyName: company?.name || 'Unknown Company',
          companyId: company?.id || 0,
          location: job.location,
          description: job.description?.substring(0, 100) + (job.description && job.description.length > 100 ? '...' : ''),
          workType: job.workType || [],
          employmentType: job.employmentType,
          department: job.department,
          status: job.status || 'active',
          createdAt: job.createdAt,
        };
      }));
      
      res.status(200).json(jobsWithCompanyInfo);
    } catch (error) {
      console.error('Error fetching admin jobs:', error);
      res.status(500).json({ 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Get Available Jobs for Jobseeker
  app.get("/api/jobseeker/jobs/available", async (req, res) => {
    // Check authentication (handles both session and mobile token auth)
    if (!req.isAuthenticated()) {
      // Attempt mobile token authentication as a fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' from header
        try {
          // Validate the mobile token
          const tokenParts = token.split('.');
          if (tokenParts.length === 2) {
            const userId = parseInt(tokenParts[0], 10);
            // Fetch the user
            const user = await storage.getUser(userId);
            if (user) {
              // Attach the user to the request
              (req as any).user = user;
              console.log(`Mobile token authentication successful for user ${userId}`);
            } else {
              console.log(`Mobile token authentication failed - user ${userId} not found`);
              return res.status(401).json({ message: "Unauthorized - invalid token" });
            }
          } else {
            console.log(`Mobile token authentication failed - invalid token format`);
            return res.status(401).json({ message: "Unauthorized - invalid token format" });
          }
        } catch (error) {
          console.error("Mobile token auth error:", error);
          return res.status(401).json({ message: "Unauthorized - token error" });
        }
      } else {
        console.log("No authentication detected for jobs feed request");
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    
    // Check user type (now that we've authenticated)
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      console.log(`User ${req.user.id} is not a jobseeker (${req.user.userType})`);
      return res.status(403).json({ message: "Forbidden - not a jobseeker" });
    }

    try {
      console.log("Fetching available jobs for jobseeker:", req.user.id);
      
      // Get all available job postings
      const jobPostings = await storage.getAllJobPostings();
      console.log(`Found ${jobPostings.length} job postings in database`);
      
      // Get the jobseeker's interests
      const jobseekerInterests = await storage.getJobseekerJobInterests(req.user.id);
      const interactedJobIds = jobseekerInterests.map(interest => interest.jobPostingId);
      
      // Filter out jobs that the user has already interacted with
      const availableJobs = jobPostings.filter(job => !interactedJobIds.includes(job.id));
      console.log(`Filtered to ${availableJobs.length} available jobs (excluding ${interactedJobIds.length} already interacted with)`);
      
      // Get company info for each job
      const jobsWithCompanyInfo = await Promise.all(availableJobs.map(async (job) => {
        console.log(`Processing job: ${job.id}, title: ${job.title}, companyId: ${job.companyId}`);
        const company = job.companyId ? await storage.getCompany(job.companyId) : null;
        console.log(`Company info for job ${job.id}:`, company ? `${company.id} - ${company.name}` : 'No company found');
        
        // Parse workType from JSON string to array
        let workTypeArray: string[] = [];
        try {
          if (job.workType) {
            console.log(`Job ${job.id} workType (before parsing):`, job.workType, typeof job.workType);
            // Handle different formats of workType data
            if (typeof job.workType === 'string') {
              workTypeArray = JSON.parse(job.workType);
            } else if (Array.isArray(job.workType)) {
              workTypeArray = job.workType;
            }
            console.log(`Job ${job.id} workType (after parsing):`, workTypeArray);
          }
        } catch (error) {
          console.error(`Error parsing workType for job ${job.id}:`, error);
          // Default to empty array if parsing fails
          workTypeArray = [];
        }
        
        // Helper functions for generating realistic job descriptions
        function getRealisticJobDescription(title: string, department?: string) {
          // Generate realistic job descriptions based on title/department
          const titleLower = (title || '').toLowerCase();
          
          if (titleLower.includes('software') || titleLower.includes('developer') || titleLower.includes('engineer')) {
            return `We are seeking a talented ${title} to join our ${department || 'technology'} team. In this role, you will design, develop, and implement software solutions that drive our business forward. You'll work in a collaborative environment with opportunities to make significant contributions to our product development lifecycle while growing your technical skills.`;
          } 
          else if (titleLower.includes('data') || titleLower.includes('analyst')) {
            return `Join our team as a ${title} and help transform our data into actionable insights. You'll be responsible for analyzing complex datasets, creating visualization tools, and working with stakeholders to make data-driven decisions that impact our business strategies.`;
          }
          else if (titleLower.includes('market') || titleLower.includes('brand')) {
            return `We're looking for a creative and strategic ${title} to develop and execute marketing campaigns that elevate our brand presence. You'll collaborate with cross-functional teams to create compelling content, manage digital marketing initiatives, and drive customer engagement across multiple channels.`;
          }
          else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui')) {
            return `As a ${title}, you'll create intuitive and engaging user experiences that delight our customers. You'll leverage design thinking methodologies to solve complex problems, create prototypes, and collaborate with developers to bring your designs to life.`;
          }
          else if (titleLower.includes('finance') || titleLower.includes('account')) {
            return `Join our finance team as a ${title} and help drive financial excellence across the organization. You'll be responsible for financial analysis, reporting, and compliance while contributing to strategic financial planning and optimization initiatives.`;
          }
          else if (titleLower.includes('sales') || titleLower.includes('account executive')) {
            return `We're seeking a results-driven ${title} to expand our client base and drive revenue growth. You'll build and nurture client relationships, understand customer needs, and develop tailored solutions that deliver value while meeting sales targets.`;
          }
          else if (titleLower.includes('hr') || titleLower.includes('human resources') || titleLower.includes('talent')) {
            return `As a ${title}, you'll help shape our organizational culture and support employee success. You'll manage talent acquisition, employee development, and engagement initiatives while ensuring compliance with HR policies and best practices.`;
          }
          else if (titleLower.includes('project') || titleLower.includes('product') || titleLower.includes('manager')) {
            return `We're looking for an organized and strategic ${title} to lead projects from conception to completion. You'll coordinate cross-functional teams, manage project timelines and resources, and ensure deliverables meet quality standards while driving innovation.`;
          }
          else {
            return `Join our dynamic team as a ${title} and contribute to our mission of delivering exceptional products and services. In this role, you'll leverage your skills and expertise to drive initiatives that support our business objectives while developing professionally in a collaborative environment.`;
          }
        }
        
        function getJobResponsibilities(title: string, department?: string) {
          // Generate job responsibilities based on title/department
          const titleLower = (title || '').toLowerCase();
          
          if (titleLower.includes('software') || titleLower.includes('developer') || titleLower.includes('engineer')) {
            return `• Design, develop, and maintain high-quality software applications
• Collaborate with cross-functional teams to define, design, and ship new features
• Implement clean, maintainable code following best practices and design patterns
• Identify and address performance bottlenecks and bugs
• Participate in code reviews and mentor junior developers
• Stay current with emerging trends and technologies`;
          } 
          else if (titleLower.includes('data') || titleLower.includes('analyst')) {
            return `• Collect, process, and analyze complex datasets to identify trends and insights
• Create and maintain dashboards and reports for key stakeholders
• Develop predictive models and algorithms to support business decisions
• Collaborate with teams to implement data-driven solutions
• Ensure data quality, integrity, and security
• Present findings and recommendations to non-technical audiences`;
          }
          else if (titleLower.includes('market') || titleLower.includes('brand')) {
            return `• Develop and execute comprehensive marketing strategies and campaigns
• Create compelling content for various digital and traditional channels
• Track and analyze marketing metrics to optimize campaign performance
• Manage social media presence and engagement initiatives
• Collaborate with design and content teams on brand messaging
• Stay current with marketing trends and competitor activities`;
          }
          else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui')) {
            return `• Create user-centered designs, wireframes, and prototypes
• Conduct user research and usability testing to inform design decisions
• Develop and maintain design systems and style guides
• Collaborate with product managers and engineers on product development
• Incorporate customer feedback into design iterations
• Stay current with design trends and accessibility standards`;
          }
          else if (titleLower.includes('finance') || titleLower.includes('account')) {
            return `• Prepare and analyze financial statements and reports
• Manage budget planning, forecasting, and variance analysis
• Ensure compliance with financial regulations and internal controls
• Optimize financial processes and systems
• Support audit activities and financial due diligence
• Provide financial insights to support strategic decision-making`;
          }
          else if (titleLower.includes('sales') || titleLower.includes('account executive')) {
            return `• Identify and pursue new business opportunities
• Build and maintain relationships with prospects and clients
• Understand customer needs and develop tailored solutions
• Prepare and deliver compelling sales presentations
• Negotiate contracts and close deals
• Meet or exceed sales targets and performance metrics`;
          }
          else if (titleLower.includes('hr') || titleLower.includes('human resources') || titleLower.includes('talent')) {
            return `• Manage full-cycle recruitment and onboarding processes
• Develop and implement employee engagement and retention programs
• Administer benefits, compensation, and performance management systems
• Ensure compliance with employment laws and regulations
• Facilitate employee relations and conflict resolution
• Support diversity, equity, and inclusion initiatives`;
          }
          else if (titleLower.includes('project') || titleLower.includes('product') || titleLower.includes('manager')) {
            return `• Define project scope, goals, and deliverables with stakeholders
• Develop project plans, timelines, and resource allocations
• Coordinate cross-functional teams throughout project lifecycle
• Monitor progress and address issues or bottlenecks
• Manage changes to project scope and requirements
• Communicate project status to stakeholders and leadership`;
          }
          else {
            return `• Contribute to team and company objectives through specialized expertise
• Collaborate with cross-functional teams on initiatives and projects
• Identify opportunities for improvement and innovation
• Maintain high-quality standards in all deliverables
• Build relationships with internal and external stakeholders
• Stay current with relevant industry trends and best practices`;
          }
        }
        
        function getJobQualifications(title: string, department?: string) {
          // Generate job qualifications based on title/department
          const titleLower = (title || '').toLowerCase();
          
          if (titleLower.includes('software') || titleLower.includes('developer') || titleLower.includes('engineer')) {
            return `• Bachelor's degree in Computer Science, Engineering, or related field
• Proficiency in relevant programming languages and frameworks
• Experience with software development methodologies and tools
• Strong problem-solving and algorithmic thinking skills
• Excellent communication and teamwork abilities
• Experience with version control systems and CI/CD pipelines`;
          } 
          else if (titleLower.includes('data') || titleLower.includes('analyst')) {
            return `• Bachelor's degree in Statistics, Mathematics, Computer Science, or related field
• Proficiency in data analysis tools and programming languages (SQL, Python, R)
• Experience with data visualization tools and techniques
• Strong analytical and problem-solving abilities
• Excellent communication skills for presenting technical concepts
• Knowledge of statistical methods and machine learning concepts`;
          }
          else if (titleLower.includes('market') || titleLower.includes('brand')) {
            return `• Bachelor's degree in Marketing, Communications, or related field
• Experience developing and executing marketing campaigns
• Proficiency with digital marketing platforms and analytics tools
• Strong creative thinking and content development skills
• Excellent written and verbal communication abilities
• Understanding of market research methodologies and consumer behavior`;
          }
          else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui')) {
            return `• Bachelor's degree in Design, Human-Computer Interaction, or related field
• Portfolio demonstrating strong design skills and problem-solving
• Proficiency with design and prototyping tools
• Experience conducting user research and usability testing
• Knowledge of accessibility standards and responsive design
• Excellent visual communication and presentation skills`;
          }
          else if (titleLower.includes('finance') || titleLower.includes('account')) {
            return `• Bachelor's degree in Finance, Accounting, or related field
• Relevant professional certifications (CPA, CFA, etc.) preferred
• Experience with financial analysis and reporting
• Proficiency with accounting software and financial systems
• Strong analytical and mathematical skills
• Attention to detail and high level of accuracy`;
          }
          else if (titleLower.includes('sales') || titleLower.includes('account executive')) {
            return `• Bachelor's degree in Business, Marketing, or related field
• Proven track record of meeting or exceeding sales targets
• Strong negotiation and relationship-building skills
• Excellent verbal and written communication abilities
• Customer-focused mindset and problem-solving approach
• Self-motivation and ability to work independently`;
          }
          else if (titleLower.includes('hr') || titleLower.includes('human resources') || titleLower.includes('talent')) {
            return `• Bachelor's degree in Human Resources, Business, or related field
• HR certifications (SHRM-CP, PHR, etc.) preferred
• Knowledge of employment laws and HR best practices
• Experience with HRIS and applicant tracking systems
• Strong interpersonal and communication skills
• Ability to maintain confidentiality and handle sensitive matters`;
          }
          else if (titleLower.includes('project') || titleLower.includes('product') || titleLower.includes('manager')) {
            return `• Bachelor's degree in Business, Engineering, or related field
• Project management certifications (PMP, Agile, Scrum) preferred
• Experience managing projects from conception to completion
• Strong organizational and time management skills
• Excellent leadership and team collaboration abilities
• Problem-solving skills and adaptability to changing requirements`;
          }
          else {
            return `• Bachelor's degree in a relevant field or equivalent experience
• Strong knowledge and expertise in the specific domain
• Excellent analytical and problem-solving abilities
• Effective communication and collaboration skills
• Ability to adapt to changing priorities and requirements
• Commitment to continuous learning and professional development`;
          }
        }
        
        function getJobBenefits(companyName: string) {
          // Generate standard benefits with some company-specific variation
          return `• Competitive salary and performance-based bonuses
• Comprehensive health, dental, and vision insurance
• 401(k) retirement plan with employer matching
• Generous paid time off and flexible work arrangements
• Professional development and continuing education support
• Employee wellness programs and team-building activities
• Collaborative and inclusive work environment at ${companyName}`;
        }
        
        function getSalaryRange(title: string, employmentType?: string) {
          // Generate realistic salary ranges based on job title and employment type
          const titleLower = (title || '').toLowerCase();
          const isFullTime = !employmentType || employmentType.toLowerCase().includes('full');
          
          if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('manager')) {
            return isFullTime ? "$90,000 - $130,000/year" : "$45 - $65/hour";
          }
          else if (titleLower.includes('software') || titleLower.includes('developer') || titleLower.includes('engineer')) {
            return isFullTime ? "$75,000 - $110,000/year" : "$40 - $55/hour";
          }
          else if (titleLower.includes('data') || titleLower.includes('analyst')) {
            return isFullTime ? "$65,000 - $95,000/year" : "$35 - $50/hour";
          }
          else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui')) {
            return isFullTime ? "$70,000 - $100,000/year" : "$35 - $55/hour";
          }
          else if (titleLower.includes('market') || titleLower.includes('sales')) {
            return isFullTime ? "$60,000 - $90,000/year + commission" : "$30 - $45/hour + commission";
          }
          else if (titleLower.includes('intern') || titleLower.includes('assistant')) {
            return isFullTime ? "$40,000 - $55,000/year" : "$20 - $25/hour";
          }
          else {
            return isFullTime ? "$55,000 - $85,000/year" : "$25 - $40/hour";
          }
        }
        
        // Create enhanced job details with more realistic descriptions based on the job title
        const enhancedJob = {
          id: job.id,
          title: job.title,
          companyName: company?.name || 'Unknown Company',
          companyId: company?.id || 0,
          location: job.location,
          description: job.description || getRealisticJobDescription(job.title, job.department || ''),
          workType: workTypeArray,
          employmentType: job.employmentType,
          department: job.department || '',
          logo: company ? company.logo || null : null,
          salary: getSalaryRange(job.title, job.employmentType),
          responsibilities: getJobResponsibilities(job.title, job.department || ''),
          qualifications: getJobQualifications(job.title, job.department || ''),
          benefits: getJobBenefits(company?.name || 'Unknown Company')
        };
        
        return enhancedJob;
      }));
      
      console.log(`Returning ${jobsWithCompanyInfo.length} jobs with company info`);
      
      // For mobile clients, add a refresh token in the response
      if (req.headers['user-agent'] && /iPhone|iPad|iPod/i.test(req.headers['user-agent'] as string) && req.user) {
        // Import randomBytes for token generation
        const { randomBytes } = await import('crypto');
        // Add the mobile token to the response metadata
        const mobileToken = `${req.user.id}.${randomBytes(16).toString('hex')}`;
        res.status(200).json({
          ...jobsWithCompanyInfo,
          _meta: {
            mobileToken,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(200).json(jobsWithCompanyInfo);
      }
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Express interest/disinterest in a job posting
  app.post("/api/jobseeker/jobs/:jobId/interest", async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      // Try mobile auth as fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 2) {
            const userId = parseInt(tokenParts[0], 10);
            const user = await storage.getUser(userId);
            if (user) {
              (req as any).user = user;
            } else {
              return res.status(401).json({ message: "Unauthorized - invalid token" });
            }
          } else {
            return res.status(401).json({ message: "Unauthorized - invalid token format" });
          }
        } catch (error) {
          return res.status(401).json({ message: "Unauthorized - token error" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    
    // Check user type
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      return res.status(403).json({ message: "Forbidden - not a jobseeker" });
    }
    
    try {
      const { jobId } = req.params;
      const { interested } = req.body;
      
      if (typeof interested !== 'boolean') {
        return res.status(400).json({ message: "Missing or invalid 'interested' parameter" });
      }
      
      // Record the job interest
      const result = await storage.expressJobInterest(req.user.id, jobId, interested);
      
      res.status(200).json({
        success: true,
        interest: result,
        message: interested ? "You expressed interest in this job" : "You saved this job as not interested"
      });
    } catch (error) {
      console.error('Error expressing job interest:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get jobs that the jobseeker expressed interest in
  app.get("/api/jobseeker/jobs/interested", async (req, res) => {
    if (!req.isAuthenticated()) {
      // Same mobile token auth as above
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 2) {
            const userId = parseInt(tokenParts[0], 10);
            const user = await storage.getUser(userId);
            if (user) {
              (req as any).user = user;
            } else {
              return res.status(401).json({ message: "Unauthorized - invalid token" });
            }
          } else {
            return res.status(401).json({ message: "Unauthorized - invalid token format" });
          }
        } catch (error) {
          return res.status(401).json({ message: "Unauthorized - token error" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      return res.status(403).json({ message: "Forbidden - not a jobseeker" });
    }
    
    try {
      const interestedJobs = await storage.getJobseekerInterestedJobs(req.user.id);
      res.status(200).json(interestedJobs);
    } catch (error) {
      console.error('Error fetching interested jobs:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get jobs that the jobseeker expressed disinterest in
  app.get("/api/jobseeker/jobs/not-interested", async (req, res) => {
    if (!req.isAuthenticated()) {
      // Same mobile token auth as above
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 2) {
            const userId = parseInt(tokenParts[0], 10);
            const user = await storage.getUser(userId);
            if (user) {
              (req as any).user = user;
            } else {
              return res.status(401).json({ message: "Unauthorized - invalid token" });
            }
          } else {
            return res.status(401).json({ message: "Unauthorized - invalid token format" });
          }
        } catch (error) {
          return res.status(401).json({ message: "Unauthorized - token error" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    
    if (req.user.userType !== USER_TYPES.JOBSEEKER) {
      return res.status(403).json({ message: "Forbidden - not a jobseeker" });
    }
    
    try {
      const notInterestedJobs = await storage.getJobseekerNotInterestedJobs(req.user.id);
      res.status(200).json(notInterestedJobs);
    } catch (error) {
      console.error('Error fetching not interested jobs:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Reset all swipes for a jobseeker (testing endpoint)
  app.post("/api/test/jobseeker/reset-swipes", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const result = await storage.resetJobseekerSwipes(req.user.id);
      console.log(`Reset ${result.count} swipes for jobseeker ${req.user.id}`);
      
      // Return a success message with count
      res.status(200).json({
        message: `Successfully reset ${result.count} swipes. Refresh the page to see new potential matches.`,
        count: result.count
      });
    } catch (error) {
      console.error("Error resetting swipes:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // === Employer Routes ===
  
  // Create/Update Employer Profile
  // Employer profile routes removed to avoid duplication with company profile
  // Employer profiles are now managed through the company profile system

  app.get("/api/employer/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      console.log(`Getting dashboard data for employer`);
      const dashboardData = await storage.getEmployerDashboard(req.user.id);
      console.log(`Dashboard data retrieved successfully`);
      res.status(200).json(dashboardData);
    } catch (error) {
      console.error(`Error getting dashboard data:`, error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Potential Matches for Employer
  app.get("/api/employer/matches/potential", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const potentialMatches = await storage.getEmployerPotentialMatches(req.user.id);
      console.log('Sending potential matches to client:', JSON.stringify(potentialMatches, null, 2));
      res.status(200).json(potentialMatches);
    } catch (error) {
      console.error('Error getting potential matches:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Handle Employer Swipe Action
  app.post("/api/employer/swipe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const { jobseekerId, interested } = req.body;
    if (!jobseekerId) return res.status(400).json({ message: "Jobseeker ID is required" });

    try {
      const result = await storage.handleEmployerSwipe(req.user.id, jobseekerId, interested);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Recent Matches for Employer
  app.get("/api/employer/matches/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const recentMatches = await storage.getEmployerRecentMatches(req.user.id);
      res.status(200).json(recentMatches);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Reset all swipes for an employer (testing endpoint)
  app.post("/api/test/employer/reset-swipes", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const result = await storage.resetEmployerSwipes(req.user.id);
      console.log(`Reset ${result.count} swipes for employer ${req.user.id}`);
      
      // Return a success message with count
      res.status(200).json({
        message: `Successfully reset ${result.count} swipes. Refresh the page to see new potential matches.`,
        count: result.count
      });
    } catch (error) {
      console.error("Error resetting swipes:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Support message endpoint - logs support requests to the console
  app.post("/api/support/message", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    
    try {
      // Log the support request to the console with clear formatting
      console.log('\n=== NEW SUPPORT REQUEST ===');
      console.log(`FROM: ${name} (${email})`);
      console.log(`SUBJECT: ${subject || 'General Support'}`);
      console.log('MESSAGE:');
      console.log('----------------------------------------');
      console.log(message);
      console.log('----------------------------------------');
      console.log(`TIMESTAMP: ${new Date().toISOString()}`);
      console.log(`TO: jeffrey@enter-n.com`);
      console.log('===========================\n');
      
      // Return success to the user
      return res.status(200).json({ 
        message: "Your message has been received. Our team will get back to you soon." 
      });
    } catch (error) {
      // Log the error but still return a user-friendly message
      console.error('Error processing support request:', error);
      return res.status(200).json({ 
        message: "Your message has been received. Our team will get back to you soon." 
      });
    }
  });

  // Website scraping endpoint for company profile creation
  app.post("/api/employer/scrape-website", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    try {
      console.log(`Scraping website ${url} for employer ${req.user.id}`);
      const scrapedData = await scrapeCompanyWebsite(url);
      res.status(200).json(scrapedData);
    } catch (error) {
      console.error('Error scraping website:', error);
      res.status(500).json({ 
        message: "Error scraping website", 
        error: (error as Error).message 
      });
    }
  });

  // Company profile draft endpoints are defined later in this file
  
  // Company management endpoints
  app.post("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const userId = req.user.id;
      const companyData = req.body;
      
      const company = await storage.createCompany(companyData, userId);
      
      // Update the user's company association
      await storage.updateUserCompanyRole(userId, company.id, 'admin');
      
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const companyId = Number(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(200).json(company);
    } catch (error) {
      console.error('Error getting company:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const companyId = Number(req.params.id);
      const companyData = req.body;
      
      // Check if the user has permission to edit this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to edit this company" });
      }
      
      const company = await storage.updateCompany(companyId, companyData);
      
      res.status(200).json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Company team management
  app.get("/api/companies/:id/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const companyId = Number(req.params.id);
      
      // Check if user has access to this company
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ message: "You don't have access to this company" });
      }
      
      const teamMembers = await storage.getCompanyTeamMembers(companyId);
      
      res.status(200).json(teamMembers);
    } catch (error) {
      console.error('Error getting company team members:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/companies/:id/invites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const companyId = Number(req.params.id);
      const { email, role } = req.body;
      
      // Check if the user has permission to invite to this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to invite to this company" });
      }
      
      const invite = await storage.createCompanyInvite({
        companyId,
        email,
        role: role || 'member',
        invitedBy: req.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      // TODO: Send invitation email
      
      res.status(201).json(invite);
    } catch (error) {
      console.error('Error creating company invite:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/companies/:id/invites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const companyId = Number(req.params.id);
      
      // Check if the user has permission to view invites for this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to view invites for this company" });
      }
      
      const invites = await storage.getCompanyInvites(companyId);
      
      res.status(200).json(invites);
    } catch (error) {
      console.error('Error getting company invites:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // View Jobseeker Profile (for employers) with profile view tracking
  app.get("/api/employer/jobseeker/:jobseekerId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const jobseekerId = parseInt(req.params.jobseekerId);
    if (isNaN(jobseekerId)) return res.status(400).json({ message: "Invalid jobseeker ID" });

    try {
      // Record the profile view
      await storage.recordJobseekerProfileView(jobseekerId, req.user.id);
      
      // Get the jobseeker profile
      const profile = await storage.getJobseekerProfile(jobseekerId);
      
      if (!profile) {
        return res.status(404).json({ message: "Jobseeker profile not found" });
      }
      
      // Return anonymized profile data to the employer
      // Only show relevant information for matching purposes
      const anonymizedProfile = {
        id: profile.userId.toString(),
        education: {
          degree: profile.degreeLevel || '',
          major: profile.major || '',
          school: profile.school || ''
        },
        locations: profile.preferredLocations || [],
        workArrangements: profile.workArrangements || [],
        industryPreferences: profile.industryPreferences || [],
        sliderValues: profile.sliderValues || {},
        // Don't include name, contact info, or other identifying information
      };
      
      res.status(200).json(anonymizedProfile);
    } catch (error) {
      console.error("Error viewing jobseeker profile:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // === Company Management Routes ===
  
  // Get company profile
  app.get("/api/employer/company", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      // If user doesn't belong to a company yet
      if (!req.user.companyId) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const company = await storage.getCompany(req.user.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Create/update company profile
  app.post("/api/employer/company", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const companyData = req.body;
      
      // If updating existing company, ensure user is an admin
      if (req.user.companyId) {
        if (req.user.companyRole !== 'admin') {
          return res.status(403).json({ message: "Only company admins can update company profiles" });
        }
        
        const updatedCompany = await storage.updateCompany(req.user.companyId, companyData);
        return res.status(200).json(updatedCompany);
      } 
      
      // Creating a new company
      const newCompany = await storage.createCompany(companyData, req.user.id);
      res.status(201).json(newCompany);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Invite team member to company
  app.post("/api/employer/company/invite", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(403).json({ message: "You must belong to a company to invite team members" });
      }
      
      if (req.user.companyRole !== 'admin') {
        return res.status(403).json({ message: "Only company admins can invite team members" });
      }
      
      const { email, role } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Create invitation
      const invite = await storage.createCompanyInvite({
        companyId: req.user.companyId,
        inviterUserId: req.user.id,
        email,
        role: role || 'recruiter'
      });
      
      // TODO: Send email invitation (future feature)
      
      res.status(201).json(invite);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get company team members
  app.get("/api/employer/company/:id/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const companyId = Number(req.params.id);
      
      // Check if user has access to this company
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ message: "You don't have access to this company" });
      }
      
      const teamMembers = await storage.getCompanyTeamMembers(companyId);
      
      // Return the array directly instead of wrapping in an object
      res.status(200).json(teamMembers);
    } catch (error) {
      console.error('Error getting company team members:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get company invites (admin/owner only)
  app.get("/api/employer/company/:id/invites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const companyId = Number(req.params.id);
      
      // Check if the user has permission to view invites for this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to view invites for this company" });
      }
      
      const invites = await storage.getCompanyInvites(companyId);
      
      // Return the array directly instead of wrapping in an object
      res.status(200).json(invites);
    } catch (error) {
      console.error('Error getting company invites:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Update team member role (admin/owner only)
  app.put("/api/employer/company/:id/team/:memberId/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const companyId = Number(req.params.id);
      const memberId = Number(req.params.memberId);
      const { role } = req.body;
      
      // Validate role
      const validRoles = ['recruiter', 'admin', 'hiring_manager'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if the user has permission to update roles in this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to update roles in this company" });
      }
      
      // Don't allow changing the role of the company owner
      const memberToUpdate = await storage.getUser(memberId);
      if (memberToUpdate?.companyRole === 'owner') {
        return res.status(403).json({ message: "Cannot change the role of the company owner" });
      }
      
      // Update user role
      const updatedUser = await storage.updateUserCompanyRole(memberId, companyId, role);
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating team member role:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Remove team member from company (admin/owner only)
  app.delete("/api/employer/company/:id/team/:memberId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const companyId = Number(req.params.id);
      const memberId = Number(req.params.memberId);
      
      // Check if the user has permission to remove members from this company
      const hasPermission = 
        req.user.companyId === companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to remove members from this company" });
      }
      
      // Don't allow removing the company owner
      const memberToRemove = await storage.getUser(memberId);
      if (memberToRemove?.companyRole === 'owner') {
        return res.status(403).json({ message: "Cannot remove the company owner" });
      }
      
      // Remove user from company
      await storage.removeUserFromCompany(memberId, companyId);
      
      res.status(200).json({ message: "Team member removed successfully" });
    } catch (error) {
      console.error('Error removing team member:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Create company invite (admin/owner only)
  app.post("/api/employer/company/invite", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const { email, role, companyId } = req.body;
      
      // Validate email and role
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      const validRoles = ['recruiter', 'admin', 'hiring_manager'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Parse company ID
      const parsedCompanyId = Number(companyId);
      
      // Check if the user has permission to create invites for this company
      const hasPermission = 
        req.user.companyId === parsedCompanyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to invite users to this company" });
      }
      
      // Create an invite
      const invite = await storage.createCompanyInvite({
        companyId: parsedCompanyId,
        inviterId: req.user.id,
        email,
        role,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      
      // Here you would normally send an email with the invitation link
      // For now, we'll just return the invite
      
      res.status(201).json(invite);
    } catch (error) {
      console.error('Error creating company invite:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Cancel/delete a company invite (admin/owner only)
  app.delete("/api/employer/company/invite/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const inviteId = req.params.id;
      
      // Get the invite to check permissions
      const invite = await storage.getCompanyInvite(inviteId);
      
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }
      
      // Check if the user has permission to cancel invites for this company
      const hasPermission = 
        req.user.companyId === invite.companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to cancel invites for this company" });
      }
      
      // Delete the invite
      await storage.deleteCompanyInvite(inviteId);
      
      res.status(200).json({ message: "Invite cancelled successfully" });
    } catch (error) {
      console.error('Error cancelling company invite:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Resend a company invite (admin/owner only)
  app.post("/api/employer/company/invite/:id/resend", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const inviteId = req.params.id;
      
      // Get the invite to check permissions
      const invite = await storage.getCompanyInvite(inviteId);
      
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }
      
      // Check if the user has permission to resend invites for this company
      const hasPermission = 
        req.user.companyId === invite.companyId && 
        (req.user.companyRole === 'admin' || req.user.companyRole === 'owner');
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to resend invites for this company" });
      }
      
      // Update the invite with a new token and expiration date
      const updatedInvite = await storage.updateCompanyInvite(inviteId, {
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'pending',
      });
      
      // Here you would normally send an email with the invitation link
      
      res.status(200).json(updatedInvite);
    } catch (error) {
      console.error('Error resending company invite:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Update team member role (admin only)
  app.put("/api/employer/company/team/:userId/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(403).json({ message: "You don't belong to a company" });
      }
      
      if (req.user.companyRole !== 'admin') {
        return res.status(403).json({ message: "Only company admins can update team member roles" });
      }
      
      const userId = parseInt(req.params.userId);
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }
      
      const updatedUser = await storage.updateUserCompanyRole(userId, req.user.companyId, role);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Remove team member (admin only)
  app.delete("/api/employer/company/team/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(403).json({ message: "You don't belong to a company" });
      }
      
      if (req.user.companyRole !== 'admin') {
        return res.status(403).json({ message: "Only company admins can remove team members" });
      }
      
      const userId = parseInt(req.params.userId);
      
      // Cannot remove yourself
      if (userId === req.user.id) {
        return res.status(400).json({ message: "You cannot remove yourself from the company" });
      }
      
      await storage.removeUserFromCompany(userId, req.user.companyId);
      res.status(200).json({ message: "Team member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // === Job Posting Routes ===
  
  // Get my job postings
  app.get("/api/employer/jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const jobs = await storage.getEmployerJobPostings(req.user.id);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get all company job postings (admin only)
  app.get("/api/employer/company/jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(403).json({ message: "You don't belong to a company" });
      }
      
      if (req.user.companyRole !== 'admin') {
        return res.status(403).json({ message: "Only company admins can view all company job postings" });
      }
      
      const jobs = await storage.getCompanyJobPostings(req.user.companyId);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get specific job posting
  app.get("/api/employer/jobs/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const job = await storage.getJobPosting(req.params.jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check if user has permission to view this job
      if (req.user.companyRole !== 'admin' && job.employerId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to view this job posting" });
      }
      
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Create job posting
  app.post("/api/employer/jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const jobData = req.body;
      
      // Handle assigned employee ID for admins
      let employerId = req.user.id;
      let companyId = req.user.companyId;
      
      // If an admin wants to create a job for another team member
      if (req.user.companyRole === 'admin' && jobData.assignedEmployerId) {
        // Verify the assigned user belongs to the same company
        const assignedUser = await storage.getUser(jobData.assignedEmployerId);
        
        if (assignedUser && assignedUser.companyId === req.user.companyId) {
          employerId = assignedUser.id;
        }
      }
      
      // Don't store assignedEmployerId in the job posting
      delete jobData.assignedEmployerId;
      
      const job = await storage.createJobPosting({
        ...jobData,
        employerId,
        companyId
      });
      
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Update job posting
  app.put("/api/employer/jobs/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const jobId = req.params.jobId;
      const jobData = req.body;
      
      // Check if job exists
      const existingJob = await storage.getJobPosting(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check permissions
      if (req.user.companyRole !== 'admin' && existingJob.employerId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this job posting" });
      }
      
      // Don't allow changing the employer ID via update
      delete jobData.employerId;
      delete jobData.assignedEmployerId;
      
      const updatedJob = await storage.updateJobPosting(jobId, jobData);
      res.status(200).json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Update job status
  app.patch("/api/employer/jobs/:jobId/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const jobId = req.params.jobId;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Check if job exists
      const existingJob = await storage.getJobPosting(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check permissions
      if (req.user.companyRole !== 'admin' && existingJob.employerId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this job posting" });
      }
      
      const updatedJob = await storage.updateJobStatus(jobId, status);
      res.status(200).json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Delete job posting
  app.delete("/api/employer/jobs/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      const jobId = req.params.jobId;
      
      // Check if job exists
      const existingJob = await storage.getJobPosting(jobId);
      
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check permissions
      if (req.user.companyRole !== 'admin' && existingJob.employerId !== req.user.id) {
        return res.status(403).json({ message: "You do not have permission to delete this job posting" });
      }
      
      await storage.deleteJobPosting(jobId);
      res.status(200).json({ message: "Job posting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Create the HTTP server
  // Scrape company website for information
  app.post("/api/employer/scrape-website", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    try {
      console.log(`Scraping company website: ${url} for user ${req.user.id}`);
      const scrapedData = await scrapeCompanyWebsite(url);
      
      if (!scrapedData.success) {
        return res.status(422).json({ 
          message: scrapedData.error || "Failed to scrape website",
          url
        });
      }
      
      console.log(`Successfully scraped company website: ${url}`);
      res.status(200).json(scrapedData);
    } catch (error) {
      console.error(`Error scraping website ${url}:`, error);
      res.status(500).json({ 
        message: (error as Error).message,
        url
      });
    }
  });
  
  // Save company profile draft
  app.post("/api/employer/company-profile/draft", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const { draftData, companyId, step, draftType } = req.body;
    const parsedCompanyId = companyId ? parseInt(companyId) : undefined;
    const currentStep = step || 1;
    const currentDraftType = draftType || 'create';
    
    try {
      console.log(`Saving company profile for user ID ${req.user.id}${parsedCompanyId ? ` and company ID ${parsedCompanyId}` : ''}, step ${currentStep}`);
      
      // Enhanced validation with detailed feedback
      if (!draftData) {
        return res.status(400).json({ 
          message: "Profile data is required",
          _meta: {
            userId: req.user.id,
            companyId: parsedCompanyId,
            timestamp: new Date().toISOString(),
            error: "Missing profile data",
            params: { step: currentStep }
          }
        });
      }
      
      // Log payload size for debugging
      console.log("Profile data size:", JSON.stringify(draftData).length, "bytes");
      
      let company;
      
      if (parsedCompanyId) {
        // Update existing company
        company = await storage.updateCompany(parsedCompanyId, {
          ...draftData,
          updatedAt: new Date()
        });
        console.log(`Company updated successfully, ID: ${company.id}`);
      } else if (req.user.companyId) {
        // Update user's existing company
        company = await storage.updateCompany(req.user.companyId, {
          ...draftData,
          updatedAt: new Date()
        });
        console.log(`User's company updated successfully, ID: ${company.id}`);
      } else {
        // Create new company and associate with user
        company = await storage.createCompany({
          ...draftData,
          createdAt: new Date(),
          updatedAt: new Date()
        }, req.user.id);
        
        // Update user with company association
        await storage.updateUser(req.user.id, {
          companyId: company.id,
          companyRole: 'admin',
          updatedAt: new Date()
        });
        
        console.log(`New company created successfully, ID: ${company.id}`);
      }
      
      // Update session with new company info if needed
      if (!req.user.companyId && company.id) {
        const updatedUser = await storage.getUser(req.user.id);
        if (updatedUser) {
          req.login(updatedUser, (err) => {
            if (err) {
              console.error("Error updating session user data:", err);
            }
          });
        }
      }
      
      // Enhanced response with more metadata
      res.status(200).json({
        ...company,
        _meta: {
          savedAt: new Date().toISOString(),
          message: "Company profile saved successfully",
          userId: req.user.id,
          companyId: company.id,
          step: currentStep,
          profileCompletion: company.profileCompletion || 0
        }
      });
    } catch (error) {
      console.error("Error saving company profile:", error);
      res.status(500).json({ 
        message: (error as Error).message,
        _meta: {
          userId: req.user?.id,
          companyId: parsedCompanyId,
          timestamp: new Date().toISOString(),
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }
  });
  
  // Get company profile (formerly "draft")
  app.get("/api/employer/company-profile/draft", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    // Get from requested ID, user's company ID, or check drafts as fallback
    const requestedCompanyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const userCompanyId = req.user.companyId;
    const targetCompanyId = requestedCompanyId || userCompanyId;
    
    try {
      let company;
      let source = "company";
      let draftData;
      let step = 1;
      
      // First try to find the company record
      if (targetCompanyId) {
        console.log(`Fetching company profile for user ID ${req.user.id} and company ID ${targetCompanyId}`);
        company = await storage.getCompany(targetCompanyId);
      }
      
      // If company not found but we have drafts, try to find a draft as fallback
      if (!company) {
        console.log(`No company found, checking for drafts for user ID ${req.user.id}`);
        
        // Check for a company profile draft in the old system (for compatibility)
        try {
          const companyDraft = await storage.getCompanyProfileDraft(req.user.id, requestedCompanyId);
          
          if (companyDraft) {
            console.log(`Draft found, ID: ${companyDraft.id}, migrating to company record`);
            
            // Create a company from the draft data
            company = await storage.createCompany(companyDraft.draftData, req.user.id);
            
            // Update user with company association
            await storage.updateUser(req.user.id, {
              companyId: company.id,
              companyRole: 'admin',
              updatedAt: new Date()
            });
            
            // Update the session user data
            const updatedUser = await storage.getUser(req.user.id);
            if (updatedUser) {
              req.login(updatedUser, (err) => {
                if (err) {
                  console.error("Error updating session user data:", err);
                }
              });
            }
            
            source = "migrated_draft";
            draftData = companyDraft.draftData;
            step = companyDraft.step || 1;
            
            console.log(`Migrated draft to company ID: ${company.id}`);
          }
        } catch (err) {
          console.log("No draft found or error accessing drafts:", err);
        }
      }
      
      if (!company) {
        console.log(`No company or draft found for user ID ${req.user.id}`);
        return res.status(404).json({
          message: "No company profile found",
          _meta: {
            userId: req.user.id,
            requestedCompanyId,
            userCompanyId,
            timestamp: new Date().toISOString(),
            path: req.path,
            query: req.query
          }
        });
      }
      
      console.log(`Company profile found, ID: ${company.id}`);
      
      // For backward compatibility, format the response like drafts were before
      res.status(200).json({
        id: company.id,
        userId: req.user.id,
        companyId: company.id,
        draftData: draftData || company,
        step: step,
        _meta: {
          fetchedAt: new Date().toISOString(),
          userId: req.user.id,
          companyId: company.id,
          source: source,
          profileComplete: (company.profileCompletion || 0) >= 100
        }
      });
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ 
        message: (error as Error).message,
        _meta: {
          userId: req.user?.id,
          requestedCompanyId,
          userCompanyId,
          timestamp: new Date().toISOString(),
          path: req.path,
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }
  });
  
  // Submit company profile draft to create or update real company profile
  app.post("/api/employer/company-profile/submit", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    const { draftId } = req.body;
    
    if (!draftId) {
      return res.status(400).json({ message: "Draft ID is required" });
    }
    
    try {
      console.log(`Submitting company profile draft ${draftId} for user ${req.user.id}`);
      
      // Submit the draft to create or update a company
      const company = await storage.submitCompanyProfileDraft(req.user.id, draftId);
      
      console.log(`Successfully created/updated company profile for user ${req.user.id}, company ID: ${company.id}`);
      
      // Return the company data with the user's company record updated
      const updatedUser = await storage.getUser(req.user.id);
      
      // Update the session user data
      if (updatedUser) {
        req.login(updatedUser, (err) => {
          if (err) {
            console.error("Error updating session user data:", err);
          }
        });
      }
      
      // Return the company data
      res.status(200).json({
        ...company,
        _meta: {
          submittedAt: new Date().toISOString(),
          userId: req.user.id,
          message: "Company profile successfully created/updated"
        }
      });
    } catch (error) {
      console.error(`Error submitting company profile draft:`, error);
      res.status(500).json({ 
        message: (error as Error).message,
        _meta: {
          userId: req.user.id,
          draftId,
          timestamp: new Date().toISOString(),
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }
  });

  // Admin endpoint to migrate company profile drafts to company records
  app.post("/api/admin/migrate-drafts", async (req, res) => {
    try {
      // Check if the request has a secret key matching DB_ADMIN_KEY
      if (req.body.key !== 'enterN-admin-secret-key') {
        return res.status(403).json({ 
          error: "Unauthorized", 
          message: "Valid admin key required for migration operations" 
        });
      }
      
      console.log("Starting draft migration via admin endpoint");
      
      // Import the migration script
      const migrateDraftsToCompanies = (await import("../scripts/migrate-drafts-to-companies")).default;
      
      // Run the migration (optional flag to delete drafts after migration)
      const deleteDrafts = req.body.deleteDrafts === true;
      const result = await migrateDraftsToCompanies(deleteDrafts);
      
      res.status(200).json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error during draft migration:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Admin endpoint to migrate employer profiles to company records
  app.post("/api/admin/merge-employer-company", async (req, res) => {
    try {
      // Check if the request has a secret key matching DB_ADMIN_KEY
      if (req.body.key !== 'enterN-admin-secret-key') {
        return res.status(403).json({ 
          error: "Unauthorized", 
          message: "Valid admin key required for migration operations" 
        });
      }
      
      console.log("Starting employer to company migration via admin endpoint");
      
      // Import the migration script
      const mergeEmployerToCompany = (await import("../scripts/merge-employer-company")).default;
      
      // Run the migration
      const result = await mergeEmployerToCompany();
      
      res.status(200).json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error during employer to company migration:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Admin endpoint to remove employer tables after migration
  app.post("/api/admin/remove-employer-tables", async (req, res) => {
    try {
      // Check if the request has a secret key matching DB_ADMIN_KEY
      if (req.body.key !== 'enterN-admin-secret-key') {
        return res.status(403).json({ 
          error: "Unauthorized", 
          message: "Valid admin key required for migration operations" 
        });
      }
      
      // Check for confirmation flag
      if (!req.body.confirm) {
        return res.status(400).json({ 
          error: "Confirmation Required", 
          message: "This operation will permanently delete tables. Add 'confirm: true' to proceed." 
        });
      }
      
      console.log("Starting employer tables removal via admin endpoint");
      
      // Import the migration script
      const removeEmployerTables = (await import("../scripts/remove-employer-tables")).default;
      
      // Run the script
      const result = await removeEmployerTables();
      
      res.status(200).json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error during employer tables removal:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Set up match routes (swipe-to-match functionality) using the existing router

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to enterN WebSocket server'
    }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
