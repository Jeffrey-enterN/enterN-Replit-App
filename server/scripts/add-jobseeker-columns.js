import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function addColumns() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log('Adding industry_preferences and functional_preferences columns to jobseeker_profiles table...');
    
    // First, check if columns already exist
    const checkColumnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobseeker_profiles'
      AND column_name IN ('industry_preferences', 'functional_preferences');
    `;
    
    const { rows: existingColumns } = await pool.query(checkColumnsQuery);
    const columnNames = existingColumns.map(col => col.column_name);
    
    // Add industry_preferences column if it doesn't exist
    if (!columnNames.includes('industry_preferences')) {
      console.log('Adding industry_preferences column...');
      await pool.query(`
        ALTER TABLE jobseeker_profiles
        ADD COLUMN industry_preferences JSONB DEFAULT '[]'::jsonb;
      `);
      console.log('Added industry_preferences column successfully');
    } else {
      console.log('industry_preferences column already exists');
    }
    
    // Add functional_preferences column if it doesn't exist
    if (!columnNames.includes('functional_preferences')) {
      console.log('Adding functional_preferences column...');
      await pool.query(`
        ALTER TABLE jobseeker_profiles
        ADD COLUMN functional_preferences TEXT DEFAULT '';
      `);
      console.log('Added functional_preferences column successfully');
    } else {
      console.log('functional_preferences column already exists');
    }
    
    console.log('Schema update completed successfully');
    await pool.end();
    
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

addColumns();