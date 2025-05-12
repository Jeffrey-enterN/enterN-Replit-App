import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  processJobseekerSwipe,
  processEmployerSwipe,
  shareJobsWithJobseeker,
  expressJobInterest,
  scheduleInterview
} from './match-utils';
import { getEmployerMatchFeedOptimized } from './match-utils-optimized';
import { USER_TYPES, companies, users } from '@shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';

/**
 * Optimized routes for handling the swipe-to-match feature
 * 
 * Improvements include:
 * 1. Pagination support for match feed
 * 2. Input validation with Zod
 * 3. Proper error handling
 * 4. Response structure standardization
 */
export function setupOptimizedMatchRoutes(router: Router) {
  /**
   * Get match feed for an employer with pagination
   * 
   * Query parameters:
   * - limit: Number of results to return (default 20)
   * - offset: Offset for pagination (default 0)
   * - sortBy: Field to sort by (default 'id', can be 'id' or 'match')
   * - sortDirection: Sort direction (default 'asc', can be 'asc' or 'desc')
   */
  router.get('/api/matches/feed', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const user = req.user;
    if (user.userType !== USER_TYPES.EMPLOYER) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only employers can access the match feed' 
      });
    }

    // Parse and validate query parameters
    const queryParamsSchema = z.object({
      limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
      offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
      sortBy: z.enum(['id', 'match']).optional().default('id'),
      sortDirection: z.enum(['asc', 'desc']).optional().default('asc'),
    }).refine(data => {
      // Ensure limit is between 1 and 100
      return data.limit >= 1 && data.limit <= 100;
    }, {
      message: "Limit must be between 1 and 100",
      path: ["limit"],
    });

    // Validate query parameters
    const queryParamsResult = queryParamsSchema.safeParse(req.query);
    if (!queryParamsResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid query parameters',
        details: queryParamsResult.error.format() 
      });
    }

    const { limit, offset, sortBy, sortDirection } = queryParamsResult.data;

    // Get match feed with pagination
    const result = await getEmployerMatchFeedOptimized(user.id, {
      limit,
      offset,
      sortBy,
      sortDirection,
    });
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error ? result.error : 'Unknown error' 
      });
    }

    // Return standardized response with pagination metadata
    res.json({
      success: true,
      data: result.jobseekers,
      pagination: result.pagination
    });
  });

  /**
   * All other match-related routes would be added here,
   * following the same pattern of improved input validation,
   * error handling, and response standardization.
   */
}