import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { db } from './db';
import { 
  users, swipes, matches, jobInterests, jobPostings,
  MATCH_STATUS, USER_TYPES
} from '@shared/schema';

/**
 * Utility functions for implementing the swipe-to-match logic
 * 
 * This handles all the business rules for the matching system:
 * - Jobseeker rejects = Profile no longer appears in company's feed
 * - Jobseeker likes = Status becomes Match for jobseeker
 * - Company rejects = Profile hidden until feed refresh
 * - Company likes = Status becomes Match for company
 * - Both match = Contact info revealed, messaging enabled, employer can share jobs
 * - Jobseeker expresses interest in job = Scheduling tool activated
 */

/**
 * Process a swipe (like/reject) from a jobseeker to a company
 * 
 * If the jobseeker likes the company:
 *   - Record the swipe with interested=true
 *   - Check if the company has already liked the jobseeker
 *   - If yes, create a match
 * 
 * If the jobseeker rejects the company:
 *   - Record the swipe with interested=false
 *   - Company will never see this jobseeker in their feed
 */
export async function processJobseekerSwipe(
  jobseekerId: number,
  employerId: number,
  interested: boolean
) {
  try {
    // Begin transaction
    return await db.transaction(async (tx) => {
      // Record the swipe
      const [swipe] = await tx
        .insert(swipes)
        .values({
          jobseekerId,
          employerId,
          interested,
        })
        .returning();

      // If not interested, we're done (jobseeker rejected)
      if (!interested) {
        return { success: true, swipe };
      }

      // Check if employer has already swiped right (interested) on this jobseeker
      const employerSwipe = await tx.query.swipes.findFirst({
        where: and(
          eq(swipes.jobseekerId, jobseekerId),
          eq(swipes.employerId, employerId),
          eq(swipes.interested, true)
        ),
      });

      // If employer has also swiped right, create a match
      if (employerSwipe?.interested) {
        const [match] = await tx
          .insert(matches)
          .values({
            jobseekerId,
            employerId,
            status: MATCH_STATUS.NEW,
            messagingEnabled: true, // Enable messaging for mutual matches
          })
          .returning();

        return { 
          success: true, 
          swipe, 
          match, 
          isMutualMatch: true 
        };
      }

      return { success: true, swipe };
    });
  } catch (error) {
    console.error('Error processing jobseeker swipe:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Process a swipe (like/reject) from a company to a jobseeker
 * 
 * If the company likes the jobseeker:
 *   - Record the swipe with interested=true
 *   - Check if the jobseeker has already liked the company
 *   - If yes, create a match
 * 
 * If the company rejects the jobseeker:
 *   - Record the swipe with interested=false 
 *   - Set hideUntil timestamp to temporarily hide the profile
 */
export async function processEmployerSwipe(
  employerId: number,
  jobseekerId: number,
  interested: boolean,
  hideUntilHours: number = 24 // Default hide for 24 hours if rejected
) {
  try {
    // Begin transaction
    return await db.transaction(async (tx) => {
      // For rejections, set a hideUntil timestamp
      const hideUntil = !interested 
        ? new Date(Date.now() + hideUntilHours * 60 * 60 * 1000) 
        : null;

      // Record the swipe
      const [swipe] = await tx
        .insert(swipes)
        .values({
          jobseekerId,
          employerId,
          interested,
          hideUntil
        })
        .returning();

      // If not interested, we're done (employer rejected)
      if (!interested) {
        return { success: true, swipe };
      }

      // Check if jobseeker has already swiped right (interested) on this employer
      const jobseekerSwipe = await tx.query.swipes.findFirst({
        where: and(
          eq(swipes.jobseekerId, jobseekerId),
          eq(swipes.employerId, employerId),
          eq(swipes.interested, true)
        ),
      });

      // If jobseeker has also swiped right, create a match
      if (jobseekerSwipe?.interested) {
        const [match] = await tx
          .insert(matches)
          .values({
            jobseekerId,
            employerId,
            status: MATCH_STATUS.NEW,
            messagingEnabled: true, // Enable messaging for mutual matches
          })
          .returning();

        return { 
          success: true, 
          swipe, 
          match, 
          isMutualMatch: true 
        };
      }

      return { success: true, swipe };
    });
  } catch (error) {
    console.error('Error processing employer swipe:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Share job postings with a matched jobseeker
 * 
 * This updates the match record with the shared job IDs and
 * changes the match status to JOBS_SHARED
 */
export async function shareJobsWithJobseeker(
  matchId: string,
  jobPostingIds: string[]
) {
  try {
    // Validate the job IDs exist
    const jobs = await db.query.jobPostings.findMany({
      where: inArray(jobPostings.id, jobPostingIds)
    });
    
    if (jobs.length !== jobPostingIds.length) {
      return { 
        success: false, 
        error: 'One or more job postings do not exist' 
      };
    }

    // Update the match with shared job IDs
    const [updatedMatch] = await db
      .update(matches)
      .set({
        jobsShared: jobPostingIds,
        status: MATCH_STATUS.JOBS_SHARED,
        updatedAt: new Date()
      })
      .where(eq(matches.id, matchId))
      .returning();

    return { success: true, match: updatedMatch };
  } catch (error) {
    console.error('Error sharing jobs with jobseeker:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Record a jobseeker's interest in a shared job posting
 * 
 * This:
 * 1. Creates a record in the job_interests table
 * 2. Updates the match status to JOB_INTERESTED
 * 3. Enables scheduling for the match
 */
export async function expressJobInterest(
  jobseekerId: number,
  jobPostingId: string,
  interested: boolean
) {
  try {
    return await db.transaction(async (tx) => {
      // Record the job interest
      const [jobInterest] = await tx
        .insert(jobInterests)
        .values({
          jobseekerId,
          jobPostingId,
          interested
        })
        .returning();

      if (!interested) {
        return { success: true, jobInterest };
      }

      // Find the related match for this job (if any)
      const job = await tx.query.jobPostings.findFirst({
        where: eq(jobPostings.id, jobPostingId),
        with: {
          company: {
            with: {
              employees: true
            }
          }
        }
      });

      if (!job) {
        return { 
          success: false, 
          error: 'Job posting not found'
        };
      }

      // Find the employer who posted this job
      const employer = job.company?.employees.find(
        emp => emp.userType === USER_TYPES.EMPLOYER
      );

      if (!employer) {
        return { 
          success: true, 
          jobInterest, 
          warning: 'No employer found for this job'
        };
      }

      // Find the match between this jobseeker and employer
      const matchRecord = await tx.query.matches.findFirst({
        where: and(
          eq(matches.jobseekerId, jobseekerId),
          eq(matches.employerId, employer.id)
        )
      });

      if (!matchRecord) {
        return { 
          success: true, 
          jobInterest, 
          warning: 'No matching record found'
        };
      }

      // Update the match to reflect job interest and enable scheduling
      const [updatedMatch] = await tx
        .update(matches)
        .set({
          status: MATCH_STATUS.JOB_INTERESTED,
          schedulingEnabled: true,
          jobPostingId,  // Set the specific job the jobseeker is interested in
          updatedAt: new Date()
        })
        .where(eq(matches.id, matchRecord.id))
        .returning();

      return { 
        success: true, 
        jobInterest, 
        match: updatedMatch,
        schedulingEnabled: true
      };
    });
  } catch (error) {
    console.error('Error expressing job interest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get jobseekers for an employer's match feed
 * 
 * A jobseeker appears in the feed when:
 * 1. They have NOT swiped on the company yet, or
 * 2. They have swiped to match (like) on the company
 * 
 * Jobseekers are excluded if:
 * 1. The employer already rejected them and the hideUntil period is active
 * 2. The jobseeker rejected the employer
 */
export async function getEmployerMatchFeed(employerId: number) {
  try {
    // Get all jobseekers
    const allJobseekers = await db.query.users.findMany({
      where: eq(users.userType, USER_TYPES.JOBSEEKER),
      with: {
        jobseekerProfile: true,
        jobseekerSwipes: {
          where: eq(swipes.employerId, employerId)
        },
        employerSwipes: {
          where: eq(swipes.employerId, employerId)
        }
      }
    });

    // Filter the jobseekers based on swipe rules
    const eligibleJobseekers = allJobseekers.filter(jobseeker => {
      // Get the jobseeker's swipe on this employer (if any)
      const jobseekerSwipe = jobseeker.jobseekerSwipes[0];
      
      // Get the employer's swipe on this jobseeker (if any)
      const employerSwipe = jobseeker.employerSwipes[0];
      
      // If the jobseeker rejected the employer, exclude them
      if (jobseekerSwipe && !jobseekerSwipe.interested) {
        return false;
      }
      
      // If the employer rejected and hideUntil is in the future, exclude them
      if (employerSwipe && 
          !employerSwipe.interested && 
          employerSwipe.hideUntil && 
          new Date(employerSwipe.hideUntil) > new Date()) {
        return false;
      }
      
      // Include all other jobseekers
      return true;
    });

    return { 
      success: true, 
      jobseekers: eligibleJobseekers 
    };
  } catch (error) {
    console.error('Error getting employer match feed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule an interview for a match
 * 
 * This updates the match with interview details and changes
 * the status to INTERVIEW_SCHEDULED
 */
export async function scheduleInterview(
  matchId: string,
  scheduledAt: Date,
  interviewStatus: string = 'scheduled'
) {
  try {
    const [updatedMatch] = await db
      .update(matches)
      .set({
        interviewScheduledAt: scheduledAt,
        interviewStatus,
        status: MATCH_STATUS.INTERVIEW_SCHEDULED,
        updatedAt: new Date()
      })
      .where(eq(matches.id, matchId))
      .returning();

    return { success: true, match: updatedMatch };
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return { success: false, error: error.message };
  }
}