/**
 * Migration to add swipedBy column to the swipes table
 * 
 * This script:
 * 1. Adds a swipedBy column to the swipes table to track who performed the swipe action
 * 2. Modifies the unique constraint to include swipedBy
 * 3. Sets default values for existing records
 */

import { Pool } from '@neondatabase/serverless';
import { USER_TYPES } from '../shared/schema';

/**
 * Adds swipedBy column to the swipes table and updates constraint
 */
async function addSwipedByColumn() {
  console.log('Starting migration: Add swipedBy column to swipes table');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Check if the column already exists
    const checkColumnExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'swipes' AND column_name = 'swiped_by'
    `);
    
    if (checkColumnExists.rowCount === 0) {
      console.log('Adding swiped_by column to swipes table');
      
      // Add the new column
      await pool.query(`
        ALTER TABLE swipes 
        ADD COLUMN swiped_by TEXT
      `);
      
      // Set default values for existing records (assuming they were jobseeker swipes)
      await pool.query(`
        UPDATE swipes 
        SET swiped_by = $1 
        WHERE swiped_by IS NULL
      `, [USER_TYPES.JOBSEEKER]);
      
      // Drop the existing unique constraint
      await pool.query(`
        ALTER TABLE swipes 
        DROP CONSTRAINT IF EXISTS swipes_jobseeker_id_employer_id_key
      `);
      
      // Add new unique constraint including swipedBy
      await pool.query(`
        ALTER TABLE swipes 
        ADD CONSTRAINT swipes_jobseeker_id_employer_id_swiped_by_key 
        UNIQUE (jobseeker_id, employer_id, swiped_by)
      `);
      
      console.log('Migration completed successfully');
    } else {
      console.log('Column swiped_by already exists, skipping migration');
    }
    
    // Commit transaction
    await pool.query('COMMIT');
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
async function main() {
  try {
    await addSwipedByColumn();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Execute the migration when this script is run directly
if (require.main === module) {
  main();
}

export { addSwipedByColumn };