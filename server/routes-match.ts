import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  processJobseekerSwipe,
  processEmployerSwipe,
  shareJobsWithJobseeker,
  expressJobInterest,
  getEmployerMatchFeed,
  scheduleInterview
} from './match-utils';
import { USER_TYPES } from '@shared/schema';

/**
 * Routes for handling the swipe-to-match feature
 * 
 * This implements the full matching workflow:
 * - Swipe actions for jobseekers and employers
 * - Job sharing from employers to matched jobseekers
 * - Job interest expression from jobseekers
 * - Interview scheduling
 */
export function setupMatchRoutes(router: Router) {
  /**
   * Get match feed for an employer
   * 
   * Returns jobseekers who:
   * 1. Have not yet swiped on the employer
   * 2. Have swiped right (interested) on the employer
   * Excludes jobseekers who have been rejected by the employer and are in the hideUntil period
   */
  router.get('/api/matches/feed', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.EMPLOYER) {
      return res.status(403).json({ error: 'Only employers can access the match feed' });
    }

    const result = await getEmployerMatchFeed(user.id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.jobseekers);
  });

  /**
   * Process a swipe action from a jobseeker
   * 
   * POST body:
   * - employerId: ID of the employer being swiped on
   * - interested: true for like, false for reject
   */
  router.post('/api/swipe/jobseeker', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.JOBSEEKER) {
      return res.status(403).json({ error: 'Only jobseekers can perform this action' });
    }

    const swipeSchema = z.object({
      employerId: z.number(),
      interested: z.boolean()
    });

    try {
      const { employerId, interested } = swipeSchema.parse(req.body);
      
      const result = await processJobseekerSwipe(
        user.id,
        employerId,
        interested
      );
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Process a swipe action from an employer
   * 
   * POST body:
   * - jobseekerId: ID of the jobseeker being swiped on
   * - interested: true for like, false for reject
   * - hideUntilHours: (optional) hours to hide rejected profile
   */
  router.post('/api/swipe/employer', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.EMPLOYER) {
      return res.status(403).json({ error: 'Only employers can perform this action' });
    }

    const swipeSchema = z.object({
      jobseekerId: z.number(),
      interested: z.boolean(),
      hideUntilHours: z.number().optional()
    });

    try {
      const { jobseekerId, interested, hideUntilHours } = swipeSchema.parse(req.body);
      
      const result = await processEmployerSwipe(
        user.id,
        jobseekerId,
        interested,
        hideUntilHours
      );
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Share job postings with a matched jobseeker
   * 
   * POST body:
   * - matchId: ID of the match
   * - jobPostingIds: Array of job posting IDs to share
   */
  router.post('/api/matches/:matchId/share-jobs', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.EMPLOYER) {
      return res.status(403).json({ error: 'Only employers can share jobs' });
    }

    const { matchId } = req.params;
    
    const shareSchema = z.object({
      jobPostingIds: z.array(z.string())
    });

    try {
      const { jobPostingIds } = shareSchema.parse(req.body);
      
      const result = await shareJobsWithJobseeker(matchId, jobPostingIds);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result.match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Express interest in a job posting
   * 
   * POST body:
   * - jobPostingId: ID of the job posting
   * - interested: true if interested, false if not
   */
  router.post('/api/jobs/:jobPostingId/interest', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.JOBSEEKER) {
      return res.status(403).json({ error: 'Only jobseekers can express job interest' });
    }

    const { jobPostingId } = req.params;
    
    const interestSchema = z.object({
      interested: z.boolean()
    });

    try {
      const { interested } = interestSchema.parse(req.body);
      
      const result = await expressJobInterest(user.id, jobPostingId, interested);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Schedule an interview for a match
   * 
   * POST body:
   * - scheduledAt: Date and time of the interview
   * - interviewStatus: (optional) Status of the interview
   */
  router.post('/api/matches/:matchId/schedule', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId } = req.params;
    
    const scheduleSchema = z.object({
      scheduledAt: z.string().or(z.date()),
      interviewStatus: z.string().optional()
    });

    try {
      const { scheduledAt, interviewStatus } = scheduleSchema.parse(req.body);
      
      // Convert string to Date if needed
      const scheduledDate = typeof scheduledAt === 'string' 
        ? new Date(scheduledAt) 
        : scheduledAt;
      
      const result = await scheduleInterview(
        matchId, 
        scheduledDate,
        interviewStatus
      );
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result.match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * Get all matches for the current user
   */
  router.get('/api/matches', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    
    try {
      // Placeholder for actual implementation
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get a specific match by ID
   */
  router.get('/api/matches/:matchId', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matchId } = req.params;
    
    try {
      // Placeholder for actual implementation
      res.json({});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}