/**
 * Migration to add slider_preferences column to the companies table
 * 
 * This script:
 * 1. Adds a slider_preferences column to the companies table
 * 2. This new column will store company preferences for matching with jobseekers
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Adds slider_preferences column to the companies table
 */
async function addSliderPreferencesColumn() {
  console.log('Adding slider_preferences column to companies table...');
  
  try {
    // Add the slider_preferences column as JSONB
    await db.execute(sql`
      ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS slider_preferences JSONB;
    `);
    
    console.log('✅ Successfully added slider_preferences column to companies table');
  } catch (error) {
    console.error('❌ Error adding slider_preferences column:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting migration: Add slider_preferences column to companies table');
    
    await addSliderPreferencesColumn();
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();