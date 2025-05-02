import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { USER_TYPES } from "../shared/schema";
import { scrapeCompanyWebsite } from "./utils/website-scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes
  setupAuth(app);

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
      const potentialMatches = await storage.getJobseekerPotentialMatches(req.user.id);
      res.status(200).json(potentialMatches);
    } catch (error) {
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
  app.post("/api/employer/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const employerProfile = await storage.createEmployerProfile(req.user.id, req.body);
      res.status(200).json(employerProfile);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Save Employer Profile Draft
  app.post("/api/employer/profile/draft", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      const profileDraft = await storage.saveEmployerProfileDraft(req.user.id, req.body);
      res.status(200).json(profileDraft);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Employer Dashboard Data
  // Get Employer Profile
  app.get("/api/employer/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });

    try {
      // First check if there's a completed profile
      const profile = await storage.getEmployerProfile(req.user.id);
      
      // Then also check if there's a draft version to merge in
      const profileDraft = await storage.getEmployerProfileDraft(req.user.id);
      
      // Merge draft with profile if both exist, preferring draft values when available
      let responseData;
      
      if (profile && profileDraft) {
        // If we have both a profile and a draft, merge them prioritizing draft values
        console.log("Found both profile and draft for employer:", req.user.id);
        
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
        console.log("Profile found and returned for employer:", req.user.id);
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
        console.log("Draft found and returned for employer:", req.user.id);
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
        console.log("No profile or draft found for employer:", req.user.id);
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
      res.status(500).json({ message: (error as Error).message });
    }
  });

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
      res.status(200).json(potentialMatches);
    } catch (error) {
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
  app.get("/api/employer/company/team", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(404).json({ message: "You don't belong to a company" });
      }
      
      const team = await storage.getCompanyTeamMembers(req.user.companyId);
      res.status(200).json({ team });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get company invites (admin only)
  app.get("/api/employer/company/invites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.EMPLOYER) return res.status(403).json({ message: "Forbidden" });
    
    try {
      if (!req.user.companyId) {
        return res.status(404).json({ message: "You don't belong to a company" });
      }
      
      if (req.user.companyRole !== 'admin') {
        return res.status(403).json({ message: "Only company admins can view invites" });
      }
      
      const invites = await storage.getCompanyInvites(req.user.companyId);
      res.status(200).json({ invites });
    } catch (error) {
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
  const httpServer = createServer(app);

  return httpServer;
}
