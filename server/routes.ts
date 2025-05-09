import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { USER_TYPES } from "../shared/schema";
import { setupMatchRoutes } from "./routes-match";
import { WebSocketServer } from 'ws';
import { Router } from "express";
import { scrapeCompanyWebsite } from "./utils/website-scraper";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes
  setupAuth(app);
  
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
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      console.log("Fetching available jobs for jobseeker:", req.user.id);
      
      // Get all available job postings
      const jobPostings = await storage.getAllJobPostings();
      console.log(`Found ${jobPostings.length} job postings in database`);
      
      // Get company info for each job
      const jobsWithCompanyInfo = await Promise.all(jobPostings.map(async (job) => {
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
        
        return {
          id: job.id,
          title: job.title,
          companyName: company?.name || 'Unknown Company',
          companyId: company?.id || 0,
          location: job.location,
          description: job.description,
          workType: workTypeArray,
          employmentType: job.employmentType,
          department: job.department,
          // Add additional job details as needed
        };
      }));
      
      console.log(`Returning ${jobsWithCompanyInfo.length} jobs with company info`);
      res.status(200).json(jobsWithCompanyInfo);
    } catch (error) {
      console.error('Error fetching available jobs:', error);
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
      console.log(`Getting dashboard data for employer ID: ${req.user.id}, username: ${req.user.username}`);
      const dashboardData = await storage.getEmployerDashboard(req.user.id);
      console.log(`Sending dashboard data to client:`, JSON.stringify(dashboardData, null, 2));
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

  // Set up match routes (swipe-to-match functionality)
  const router = Router();
  setupMatchRoutes(router);
  app.use(router);

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
