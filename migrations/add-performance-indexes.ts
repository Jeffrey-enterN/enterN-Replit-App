/**
 * Migration to add performance-enhancing indexes to the database
 * 
 * This script adds indexes to common query fields to improve performance
 * as the application scales to hundreds or thousands of users.
 */

import { pool } from '../server/db';

/**
 * Add indexes to tables for performance improvement
 */
async function addPerformanceIndexes() {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Adding performance indexes...');
    
    // Add index to users table for userType lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_user_type
      ON users (user_type);
    `);
    console.log('Added index on users.user_type');
    
    // Add composite index for swipes lookups by employer and jobseeker
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_swipes_employer_jobseeker
      ON swipes (employer_id, jobseeker_id);
    `);
    console.log('Added index on swipes (employer_id, jobseeker_id)');
    
    // Add index for swipes by the swiped_by field
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_swipes_swiped_by
      ON swipes (swiped_by);
    `);
    console.log('Added index on swipes.swiped_by');
    
    // Add index for job_interests lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_job_interests_jobseeker_job
      ON job_interests (jobseeker_id, job_posting_id);
    `);
    console.log('Added index on job_interests (jobseeker_id, job_posting_id)');
    
    // Add index for matches lookups by status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_matches_status
      ON matches (status);
    `);
    console.log('Added index on matches.status');
    
    // Add index for job postings by employer
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_job_postings_employer
      ON job_postings (employer_id);
    `);
    console.log('Added index on job_postings.employer_id');
    
    // Add index for job postings by status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_job_postings_status
      ON job_postings (status);
    `);
    console.log('Added index on job_postings.status');
    
    // Add text search index for job posting title and description
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_job_postings_text_search
      ON job_postings USING gin(to_tsvector('english', title || ' ' || description));
    `);
    console.log('Added text search index on job_postings (title, description)');
    
    // Add index for users by company
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company
      ON users (company_id);
    `);
    console.log('Added index on users.company_id');
    
    // Add index on jobseeker profiles userId
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_jobseeker_profiles_user
      ON jobseeker_profiles (user_id);
    `);
    console.log('Added index on jobseeker_profiles.user_id');
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('Successfully added all performance indexes');
    
  } catch (error) {
    // Roll back the transaction on error
    await client.query('ROLLBACK');
    console.error('Error adding performance indexes:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await addPerformanceIndexes();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  main();
}

// Export for testing or programmatic use
export { addPerformanceIndexes };