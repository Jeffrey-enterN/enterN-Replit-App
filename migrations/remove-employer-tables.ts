import { Pool } from '@neondatabase/serverless';
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Migration to remove employer_profiles and employer_profile_drafts tables after data migration
 * 
 * IMPORTANT: This should only be run after merge-employer-company.ts has successfully completed
 * and the data has been verified.
 */
async function removeEmployerTables() {
  console.log('Starting migration to remove employer tables...');
  
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      console.log('Removing employerProfiles references from jobPostings table...');
      
      // Update job_postings to remove relation to employer_profiles
      await tx.execute(sql`
        -- Remove employerProfile relation from job_postings table
        ALTER TABLE job_postings
        DROP CONSTRAINT IF EXISTS job_postings_employer_id_users_id_fk;
      `);
      
      console.log('Removing employerProfile references from users relation...');
      
      // Now drop the tables
      console.log('Dropping employer_profile_drafts table...');
      await tx.execute(sql`DROP TABLE IF EXISTS employer_profile_drafts;`);
      
      console.log('Dropping employer_profiles table...');
      await tx.execute(sql`DROP TABLE IF EXISTS employer_profiles;`);
      
      console.log('Tables successfully removed');
    });
    
    console.log('Employer tables removed successfully');
    return { success: true, message: 'Employer tables removed successfully' };
  } catch (error) {
    console.error('Error during table removal:', error);
    return { success: false, message: error.message };
  }
}

// Execute the migration when this script is run directly
// For ESM compatibility
if (import.meta.url === `file://${process.argv[1]}`) {
  removeEmployerTables()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export default removeEmployerTables;