import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Migration to add job_interests table and enhance matches and swipes
 * 
 * This addresses the complete swipe-to-match logic:
 * - Add job_interests table to track jobseeker interest in jobs
 * - Enhance matches table with scheduling and messaging fields
 * - Add new status fields to support the match workflow
 */
async function addJobInterestsAndEnhanceMatching() {
  console.log('Starting migration to enhance match system...');
  
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      console.log('Creating job_interests table...');
      
      // Create job_interests table
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS job_interests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          jobseeker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
          interested BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(jobseeker_id, job_posting_id)
        );
      `);
      
      // Add hide_until field to swipes to allow temporary hiding
      console.log('Adding hide_until field to swipes table...');
      await tx.execute(sql`
        ALTER TABLE swipes
        ADD COLUMN IF NOT EXISTS hide_until TIMESTAMP;
      `);
      
      // Enhance matches table with fields for messaging and scheduling
      console.log('Enhancing matches table with messaging and scheduling fields...');
      await tx.execute(sql`
        -- Add new columns for messaging and scheduling
        ALTER TABLE matches
        ADD COLUMN IF NOT EXISTS messaging_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS scheduling_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS jobs_shared JSONB,
        ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS interview_status TEXT;
      `);
      
      console.log('Tables successfully updated');
    });
    
    console.log('Match system enhancement completed successfully');
    return { success: true, message: 'Match system enhancement completed successfully' };
  } catch (error) {
    console.error('Error during match system enhancement:', error);
    return { success: false, message: error.message };
  }
}

// For ESM compatibility
if (import.meta.url === `file://${process.argv[1]}`) {
  addJobInterestsAndEnhanceMatching()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export default addJobInterestsAndEnhanceMatching;