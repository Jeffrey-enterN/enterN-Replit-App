import { eq, and, or, isNull, gt, inArray, desc, sql, asc } from 'drizzle-orm';
import { db } from './db';
import { 
  users, swipes, matches, jobInterests, jobPostings,
  MATCH_STATUS, USER_TYPES
} from '@shared/schema';

/**
 * Optimized version of getEmployerMatchFeed with pagination support
 * 
 * This function:
 * 1. Supports pagination via limit/offset
 * 2. Reduces memory usage by loading only necessary fields
 * 3. Minimizes in-memory sorting by using database sorting when possible
 * 4. Adds logging only in development environment
 */
export async function getEmployerMatchFeedOptimized(
  employerId: number, 
  options: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const { 
      limit = 20, 
      offset = 0,
      sortBy = 'id',
      sortDirection = 'asc'
    } = options;
    
    // Log only in development
    if (isDev) {
      console.log(`Getting potential matches for employer: ${employerId} with limit ${limit}, offset ${offset}`);
    }
    
    // Get the company for this employer to access preferences
    const employer = await db.query.users.findFirst({
      where: eq(users.id, employerId),
      with: {
        company: true
      }
    });

    if (!employer || !employer.company) {
      return { success: false, error: "Employer or company not found" };
    }

    // Get jobseekers who haven't been rejected by this employer
    // and haven't rejected this employer
    // Use a more efficient query with pagination
    
    // First, get IDs of jobseekers who have rejected this employer
    const rejectedByJobseeker = await db
      .select({ jobseekerId: swipes.jobseekerId })
      .from(swipes)
      .where(and(
        eq(swipes.employerId, employerId),
        eq(swipes.interested, false),
        eq(swipes.swipedBy, USER_TYPES.JOBSEEKER)
      ));
    
    const rejectedByJobseekerIds = rejectedByJobseeker.map(r => r.jobseekerId);
    
    // Then, get IDs of jobseekers who have been rejected by this employer
    const rejectedByEmployer = await db
      .select({ jobseekerId: swipes.jobseekerId })
      .from(swipes)
      .where(and(
        eq(swipes.employerId, employerId),
        eq(swipes.interested, false),
        eq(swipes.swipedBy, USER_TYPES.EMPLOYER)
      ));
    
    const rejectedByEmployerIds = rejectedByEmployer.map(r => r.jobseekerId);
    
    // Query eligible jobseekers directly with pagination
    // This avoids loading all jobseekers into memory
    const jobseekersQuery = db.query.users.findMany({
      where: and(
        eq(users.userType, USER_TYPES.JOBSEEKER),
        // Exclude jobseekers who have rejected this employer
        rejectedByJobseekerIds.length > 0 
          ? not(inArray(users.id, rejectedByJobseekerIds)) 
          : undefined,
        // Exclude jobseekers who have been rejected by this employer
        rejectedByEmployerIds.length > 0 
          ? not(inArray(users.id, rejectedByEmployerIds)) 
          : undefined
      ),
      with: {
        jobseekerProfile: true,
        // Only get swipes related to this employer
        jobseekerSwipes: {
          where: and(
            eq(swipes.employerId, employerId),
            eq(swipes.swipedBy, USER_TYPES.JOBSEEKER)
          )
        },
        employerSwipes: {
          where: and(
            eq(swipes.employerId, employerId),
            eq(swipes.swipedBy, USER_TYPES.EMPLOYER)
          )
        }
      },
      limit,
      offset,
      orderBy: sortBy === 'id' 
        ? (sortDirection === 'asc' ? asc(users.id) : desc(users.id))
        : undefined
    });
    
    // Only in development, we count total records for debugging
    let totalCount = 0;
    if (isDev) {
      const countResult = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(and(
          eq(users.userType, USER_TYPES.JOBSEEKER),
          // Exclude jobseekers who have rejected this employer
          rejectedByJobseekerIds.length > 0 
            ? not(inArray(users.id, rejectedByJobseekerIds)) 
            : undefined,
          // Exclude jobseekers who have been rejected by this employer
          rejectedByEmployerIds.length > 0 
            ? not(inArray(users.id, rejectedByEmployerIds)) 
            : undefined
        ));
      
      totalCount = Number(countResult[0]?.count || 0);
      console.log(`Total eligible jobseekers: ${totalCount}`);
    }
    
    const jobseekers = await jobseekersQuery;
    
    if (isDev) {
      console.log(`Retrieved ${jobseekers.length} jobseekers`);
    }
    
    // Only sort in memory if we need to use company preferences,
    // which can't be done efficiently at the database level
    let sortedJobseekers = jobseekers;
    
    // If the company has slider preferences, use them to score and sort jobseekers
    const hasPreferences = employer.company.sliderPreferences && 
                         employer.company.sliderPreferences.preferredSliders &&
                         employer.company.sliderPreferences.preferredSliders.length > 0;
    
    if (sortBy === 'match' && hasPreferences) {
      sortedJobseekers = jobseekers.sort((a, b) => {
        const scoreA = calculateMatchScore(
          a.jobseekerProfile?.sliderValues || {}, 
          employer.company.sliderPreferences
        );
        
        const scoreB = calculateMatchScore(
          b.jobseekerProfile?.sliderValues || {}, 
          employer.company.sliderPreferences
        );
        
        // Sort in descending order (highest match score first)
        return scoreB - scoreA;
      });
      
      if (isDev) {
        console.log(`Sorted jobseekers based on company preferences`);
      }
    }
    
    return { 
      success: true, 
      jobseekers: sortedJobseekers,
      pagination: {
        limit,
        offset,
        total: isDev ? totalCount : undefined
      }
    };
  } catch (error) {
    console.error('Error getting employer match feed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Helper function to check if value is NOT in array - needed because
// Drizzle doesn't have a direct 'not in array' operator
function not(condition: any) {
  return sql`NOT (${condition})`;
}

/**
 * Calculate match score between jobseeker sliders and company preferences
 * This function is kept the same as the original
 */
function calculateMatchScore(
  sliderValues: Record<string, number>,
  preferences?: {
    preferredSliders: string[],
    preferredSides: Record<string, "left" | "right">
  }
) {
  if (!preferences || !preferences.preferredSliders || preferences.preferredSliders.length === 0) {
    return 0.5; // Default middle score if no preferences
  }
  
  const { preferredSliders, preferredSides } = preferences;
  let totalScore = 0;
  
  for (const sliderId of preferredSliders) {
    // If jobseeker doesn't have this slider value, use a neutral 50
    const jobseekerValue = sliderValues[sliderId] || 50;
    const preferredSide = preferredSides[sliderId];
    
    let sliderScore = 0;
    
    if (preferredSide === "left") {
      // For left preference, lower values are better (0-49)
      sliderScore = 1 - (jobseekerValue / 100);
    } else if (preferredSide === "right") {
      // For right preference, higher values are better (51-100)
      sliderScore = jobseekerValue / 100;
    } else {
      // If no side preference, use a bell curve centered at 50
      const distanceFromCenter = Math.abs(jobseekerValue - 50);
      sliderScore = 1 - (distanceFromCenter / 50);
    }
    
    totalScore += sliderScore;
  }
  
  // Normalize score to 0-1 range
  return preferredSliders.length > 0 ? totalScore / preferredSliders.length : 0.5;
}