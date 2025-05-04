import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { USER_TYPES } from "../shared/schema";
import { scrapeCompanyWebsite } from "./utils/website-scraper";
import { sql } from "drizzle-orm";
import { initEmailService, sendEmail } from "./utils/email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the email service
  initEmailService();
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
        const { users, employerProfiles, swipes } = await import("../shared/schema");
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
          
          // Check if the HR user has an employer profile
          const hrProfiles = await db
            .select()
            .from(employerProfiles)
            .where(eq(employerProfiles.userId, hrUser.id));
            
          console.log(`HR employer profiles found: ${hrProfiles.length}`);
          
          // Also check if they have a company
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
          
          if (hrProfiles.length > 0) {
            console.log('HR employer profile found:', JSON.stringify(hrProfiles[0]));
          } else {
            console.log('HR employer profile NOT found in the database');
            console.log('Creating an employer profile for the HR user...');
            
            // Create an employer profile for the HR user
            try {
              const profileData = {
                companyName: "enterN Inc.",
                companySize: "51-200",
                industry: "Software & Technology",
                headquarters: "Peoria, IL",
                companyType: "Startup",
                founded: "2024",
                about: "enterN helps early-career talent match with employers",
                website: "https://www.enter-n.com",
                aboutCompany: "enterN is changing the way companies connect with early-career talent through AI-driven matching algorithms that focus on company culture fit and values alignment rather than just resumes and keywords."
              };
              
              const newProfile = await db.insert(employerProfiles).values({
                userId: hrUser.id,
                ...profileData
              }).returning();
              
              console.log('Created employer profile for HR user:', JSON.stringify(newProfile));
            } catch (profileError) {
              console.error('Error creating employer profile for HR user:', profileError);
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

  // === Employer Routes ===
  
  // Create/Update Employer Profile
  // Employer profile routes removed to avoid duplication with company profile
  // Employer profiles are now managed through the company profile system

  app.get("/api/employer/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const dashboardData = await storage.getEmployerDashboard(req.user.id);
      res.status(200).json(dashboardData);
    } catch (error) {
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
  
  // Support message endpoint
  app.post("/api/support/message", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    
    try {
      // Log the support request regardless of email success
      console.log('=== NEW SUPPORT REQUEST ===');
      console.log(`From: ${name} (${email})`);
      console.log(`Subject: ${subject || 'General Support'}`);
      console.log(`Message: ${message}`);
      console.log('===========================');
      
      // Try to send the email
      const result = await sendEmail({
        to: 'jeffrey@enter-n.com',
        // Use the same email as TO for the FROM field to avoid verification issues
        from: 'jeffrey@enter-n.com', // Should be already verified
        subject: `Support Request: ${subject || 'General Support'}`,
        html: `
          <h1>New Support Request from enterN</h1>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || 'General Support'}</p>
          <hr />
          <h2>Message:</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr />
          <p><small>Reply directly to this email to contact the user.</small></p>
        `,
      });
      
      if (result) {
        return res.status(200).json({ message: "Support message sent successfully" });
      } else {
        // Still return success to the user, as we've logged the message
        console.log('Email sending failed but support request was logged');
        return res.status(200).json({ 
          message: "Your message has been received. Our team will get back to you soon.",
          note: "Email delivery is currently in maintenance mode, but your request has been logged."
        });
      }
    } catch (error) {
      // Log the error but still return a user-friendly message
      console.error('Error in support message processing:', error);
      return res.status(200).json({ 
        message: "Your message has been received. Our team will get back to you soon.",
        note: "Email delivery encountered an issue, but your request has been logged."
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
      console.log(`Saving draft for user ID ${req.user.id}${parsedCompanyId ? ` and company ID ${parsedCompanyId}` : ''}, step ${currentStep}, type: ${currentDraftType}`);
      
      // Enhanced validation with detailed feedback
      if (!draftData) {
        return res.status(400).json({ 
          message: "Draft data is required",
          _meta: {
            userId: req.user.id,
            companyId: parsedCompanyId,
            timestamp: new Date().toISOString(),
            error: "Missing draft data",
            params: { step: currentStep, draftType: currentDraftType }
          }
        });
      }
      
      // Log payload size for debugging
      console.log("Draft data size:", JSON.stringify(draftData).length, "bytes");
      
      const companyDraft = await storage.saveCompanyProfileDraft(
        req.user.id, 
        draftData, 
        parsedCompanyId, 
        currentStep,
        currentDraftType
      );
      
      console.log(`Draft saved successfully, ID: ${companyDraft.id}`);
      
      // Enhanced response with more metadata
      res.status(200).json({
        ...companyDraft,
        _meta: {
          savedAt: new Date().toISOString(),
          message: "Company profile draft saved successfully",
          userId: req.user.id,
          companyId: parsedCompanyId,
          step: currentStep,
          draftType: currentDraftType,
          draftId: companyDraft.id
        }
      });
    } catch (error) {
      console.error("Error saving company profile draft:", error);
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
  
  // Get company profile draft
  app.get("/api/employer/company-profile/draft", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    
    try {
      console.log(`Fetching draft for user ID ${req.user.id}${companyId ? ` and company ID ${companyId}` : ''}`);
      
      const companyDraft = await storage.getCompanyProfileDraft(req.user.id, companyId);
      
      if (!companyDraft) {
        console.log(`No draft found for user ID ${req.user.id}${companyId ? ` and company ID ${companyId}` : ''}`);
        return res.status(404).json({
          message: "No company profile draft found",
          _meta: {
            userId: req.user.id,
            companyId,
            timestamp: new Date().toISOString(),
            path: req.path,
            query: req.query
          }
        });
      }
      
      console.log(`Draft found, ID: ${companyDraft.id}, step: ${companyDraft.step}, type: ${companyDraft.draftType}`);
      
      res.status(200).json({
        ...companyDraft,
        _meta: {
          fetchedAt: new Date().toISOString(),
          userId: req.user.id,
          companyId,
          source: "draft",
          draftId: companyDraft.id,
          draftType: companyDraft.draftType || 'create',
          step: companyDraft.step || 1,
          lastActive: companyDraft.lastActive || companyDraft.updatedAt
        }
      });
    } catch (error) {
      console.error("Error fetching company profile draft:", error);
      res.status(500).json({ 
        message: (error as Error).message,
        _meta: {
          userId: req.user?.id,
          companyId,
          timestamp: new Date().toISOString(),
          path: req.path,
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
