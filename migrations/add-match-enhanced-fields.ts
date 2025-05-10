/**
 * Migration to add missing columns to the matches table
 * 
 * This script:
 * 1. Adds messaging_enabled, scheduling_enabled columns to the matches table
 * 2. Adds jobs_shared jsonb column for storing shared job IDs
 * 3. Adds interview_scheduled_at and interview_status columns for scheduling
 */

import { pool, db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Adds the missing columns to the matches table
 */
async function addMatchEnhancedFields() {
  try {
    console.log('Starting migration: Adding enhanced fields to matches table...');
    
    // Add the missing columns
    await db.execute(sql`
      -- Add messaging_enabled column
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS messaging_enabled BOOLEAN DEFAULT FALSE;
      
      -- Add scheduling_enabled column
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS scheduling_enabled BOOLEAN DEFAULT FALSE;
      
      -- Add jobs_shared column
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS jobs_shared JSONB;
      
      -- Add interview_scheduled_at column
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP;
      
      -- Add interview_status column
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS interview_status TEXT;
    `);
    
    console.log('Successfully added enhanced fields to matches table');
    
    return { success: true, message: 'Match enhanced fields added successfully' };
  } catch (error) {
    console.error('Error adding match enhanced fields:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('Starting migration...');
  
  try {
    const result = await addMatchEnhancedFields();
    
    if (result.success) {
      console.log('Migration completed successfully!');
    } else {
      console.error('Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
    console.log('Database connection closed');
  }
}

main();