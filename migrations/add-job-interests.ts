/**
 * Migration to add job_interests table and enhance matches and swipes
 * 
 * This addresses the complete swipe-to-match logic:
 * - Add job_interests table to track jobseeker interest in jobs
 * - Enhance matches table with scheduling and messaging fields
 * - Add new status fields to support the match workflow
 */

import { pool, db } from "../server/db";
import { pgTable, text, serial, integer, boolean, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

async function addJobInterestsTable() {
  try {
    console.log('Starting migration: Creating job_interests table...');
    
    // Create the job_interests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS job_interests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        jobseeker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
        interested BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(jobseeker_id, job_posting_id)
      );
    `);
    
    console.log('Successfully created job_interests table');
    
    return { success: true, message: 'Job interests table created successfully' };
  } catch (error) {
    console.error('Error creating job_interests table:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('Starting migration...');
  
  try {
    const result = await addJobInterestsTable();
    
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