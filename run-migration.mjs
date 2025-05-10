/**
 * Run migration for the swiped_by column
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

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
    
    if (checkColumnExists.rows.length === 0) {
      console.log('Adding swiped_by column to swipes table');
      
      // Drop existing constraint if it exists
      try {
        await pool.query(`
          ALTER TABLE swipes 
          DROP CONSTRAINT IF EXISTS swipes_jobseeker_id_employer_id_direction_unique
        `);
        console.log('Dropped existing constraint');
      } catch (error) {
        console.log('No constraint to drop or error dropping constraint:', error.message);
      }
      
      // Add the swipedBy column
      await pool.query(`
        ALTER TABLE swipes 
        ADD COLUMN swiped_by VARCHAR(20) NOT NULL DEFAULT 'employer'
      `);
      console.log('Added swiped_by column');
      
      // Set default values based on direction
      await pool.query(`
        UPDATE swipes 
        SET swiped_by = CASE 
          WHEN direction = 'jobseeker-to-employer' THEN 'jobseeker' 
          ELSE 'employer' 
        END
      `);
      console.log('Updated existing records with default values');
      
      // Create new unique constraint including swipedBy
      await pool.query(`
        ALTER TABLE swipes 
        ADD CONSTRAINT swipes_jobseeker_id_employer_id_direction_swiped_by_unique 
        UNIQUE (jobseeker_id, employer_id, direction, swiped_by)
      `);
      console.log('Added new constraint with swiped_by column');
      
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

async function main() {
  try {
    await addSwipedByColumn();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();