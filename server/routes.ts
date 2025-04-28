import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { USER_TYPES } from "../shared/schema";

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
      const profileDraft = await storage.saveJobseekerProfileDraft(req.user.id, req.body);
      console.log("Profile draft saved successfully for user:", req.user.id);
      res.status(200).json(profileDraft);
    } catch (error) {
      console.error("Error saving profile draft:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get Jobseeker Dashboard Data
  // Get Jobseeker Profile
  app.get("/api/jobseeker/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== USER_TYPES.JOBSEEKER) return res.status(403).json({ message: "Forbidden" });

    try {
      const profile = await storage.getJobseekerProfile(req.user.id);
      if (profile) {
        res.status(200).json(profile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: (error as Error).message });
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
      const profile = await storage.getEmployerProfile(req.user.id);
      if (profile) {
        res.status(200).json(profile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
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

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
