// Migration script to convert functionalPreferences from text to jsonb array
// This script should be run before applying the schema change to avoid data loss

import { Pool, neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

config();

// Set WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateFunctionalPreferences() {
  const client = await pool.connect();

  try {
    console.log('Starting migration of functionalPreferences data...');
    
    // Begin transaction
    await client.query('BEGIN');

    // Get all jobseeker profiles
    const { rows: profiles } = await client.query('SELECT id, functional_preferences FROM jobseeker_profiles WHERE functional_preferences IS NOT NULL');
    
    console.log(`Found ${profiles.length} profiles to migrate`);

    // Update each profile
    for (const profile of profiles) {
      if (!profile.functional_preferences) {
        console.log(`Profile ${profile.id} has no functional_preferences data to migrate`);
        continue;
      }

      // Convert text to array (split by commas and trim each value)
      let functionalPreferences;
      
      if (typeof profile.functional_preferences === 'string') {
        functionalPreferences = profile.functional_preferences
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else {
        // Already an array or invalid format
        console.log(`Profile ${profile.id} functional_preferences is not a string: ${typeof profile.functional_preferences}`);
        continue;
      }

      // Add _temp suffix to avoid conflicts with schema change
      await client.query(
        'UPDATE jobseeker_profiles SET functional_preferences_temp = $1 WHERE id = $2',
        [JSON.stringify(functionalPreferences), profile.id]
      );

      console.log(`Migrated profile ${profile.id}: ${profile.functional_preferences} -> ${JSON.stringify(functionalPreferences)}`);
    }

    console.log('All profiles migrated successfully');
    await client.query('COMMIT');
    console.log('Transaction committed');

    console.log('\nNext Steps:');
    console.log('1. Run schema change to convert functional_preferences column to jsonb');
    console.log('2. Run update SQL to move data from temporary column: UPDATE jobseeker_profiles SET functional_preferences = functional_preferences_temp::jsonb WHERE functional_preferences_temp IS NOT NULL;');
    console.log('3. Drop temporary column: ALTER TABLE jobseeker_profiles DROP COLUMN functional_preferences_temp;');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
    throw error;
  } finally {
    client.release();
    console.log('Database connection released');
  }
}

// Run the migration
migrateFunctionalPreferences()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });