/**
 * Migration to remove employer_profiles and employer_profile_drafts tables after data migration
 * 
 * IMPORTANT: This should only be run after merge-employer-company.ts has successfully completed
 * and the data has been verified.
 */

import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

// List of tables to drop
const TABLES_TO_DROP = [
  'employer_profiles',
  'employer_profile_drafts'
];

async function removeEmployerTables() {
  console.log('Starting removal of employer tables...');
  
  try {
    const results = [];
    
    // Drop each table
    for (const tableName of TABLES_TO_DROP) {
      try {
        console.log(`Dropping table: ${tableName}`);
        
        // Check if table exists
        const tableExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = ${tableName}
          );
        `);
        
        const exists = tableExists.rows[0].exists;
        
        if (exists) {
          // Drop the table
          await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)} CASCADE;`);
          console.log(`Successfully dropped table: ${tableName}`);
          results.push({ table: tableName, dropped: true });
        } else {
          console.log(`Table ${tableName} does not exist, skipping`);
          results.push({ table: tableName, dropped: false, reason: 'Table does not exist' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error dropping table ${tableName}:`, errorMessage);
        results.push({ table: tableName, dropped: false, error: errorMessage });
      }
    }
    
    console.log('Table removal completed');
    return { 
      success: true,
      results
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during table removal:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Run the migration if this script is executed directly
const isMainModule = process.argv[1]?.endsWith('scripts/remove-employer-tables.ts');

if (isMainModule) {
  // Request user confirmation
  console.log(`
WARNING: This script will permanently remove the following tables:
${TABLES_TO_DROP.map(t => `- ${t}`).join('\n')}

This action CANNOT be undone. Make sure you have:
1. Run the merge-employer-company.ts script first
2. Verified that all data has been successfully migrated
3. Made a backup of your database

To proceed, add the --confirm flag to the command.
  `);
  
  const confirmed = process.argv.includes('--confirm');
  
  if (confirmed) {
    removeEmployerTables()
      .then(result => {
        console.log('Table removal result:', result);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Unhandled error during table removal:', error);
        process.exit(1);
      });
  } else {
    console.log('Operation aborted. Add --confirm flag to proceed with table removal.');
    process.exit(0);
  }
}

export default removeEmployerTables;