/**
 * Migration script to convert all company profile drafts into real company records
 * This script will:
 * 1. Find all company profile drafts
 * 2. Convert each draft into a real company record or update existing one
 * 3. Associate users with their company records 
 * 4. (Optionally) Remove the drafts after successful migration
 */

import { db, pool } from '../server/db';
import { 
  companyProfileDrafts, 
  companies, 
  users
} from '../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

async function migrateDraftsToCompanies(deleteDrafts = false) {
  console.log('Starting migration of company profile drafts to company records...');
  
  try {
    // Get all company profile drafts
    const drafts = await db
      .select()
      .from(companyProfileDrafts)
      .orderBy(desc(companyProfileDrafts.updatedAt));
    
    console.log(`Found ${drafts.length} company profile drafts to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Migrate each draft
    for (const draft of drafts) {
      try {
        console.log(`Processing draft ID: ${draft.id} for user ID: ${draft.userId}`);
        
        // Check if the company already exists
        if (draft.companyId) {
          // Update existing company
          console.log(`Updating existing company ID: ${draft.companyId}`);
          
          const [updatedCompany] = await db
            .update(companies)
            .set({
              ...draft.draftData,
              updatedAt: new Date()
            })
            .where(eq(companies.id, draft.companyId))
            .returning();
          
          console.log(`Updated company ID: ${updatedCompany.id} (${updatedCompany.name || 'Unnamed'})`);
          migratedCount++;
        } else {
          // Create new company
          console.log(`Creating new company for user ID: ${draft.userId}`);
          
          const [newCompany] = await db
            .insert(companies)
            .values({
              ...draft.draftData,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          console.log(`Created company ID: ${newCompany.id} (${newCompany.name || 'Unnamed'})`);
          
          // Associate user with the company
          await db
            .update(users)
            .set({
              companyId: newCompany.id,
              companyRole: 'admin',
              updatedAt: new Date()
            })
            .where(eq(users.id, draft.userId));
          
          console.log(`Associated user ID: ${draft.userId} with company ID: ${newCompany.id}`);
          migratedCount++;
        }
        
        // Optionally delete the draft
        if (deleteDrafts) {
          await db
            .delete(companyProfileDrafts)
            .where(eq(companyProfileDrafts.id, draft.id));
          
          console.log(`Deleted draft ID: ${draft.id}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error migrating draft ID: ${draft.id}:`, errorMessage);
        errorCount++;
      }
    }
    
    console.log(`Migration completed with: 
- ${migratedCount} drafts successfully migrated to companies
- ${skippedCount} drafts skipped
- ${errorCount} errors encountered
- ${deleteDrafts ? 'Drafts were deleted after migration' : 'Drafts were preserved'}`);
    
    return { 
      success: true,
      migratedCount,
      skippedCount,
      errorCount,
      draftsDeleted: deleteDrafts
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during migration:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration if this script is executed directly
// When using ES modules, we can detect if the script is being run directly
// by checking if import.meta.url is the same as process.argv[1]
const isMainModule = process.argv[1]?.endsWith('scripts/migrate-drafts-to-companies.ts');

if (isMainModule) {
  // Check if --delete-drafts flag is provided
  const deleteDrafts = process.argv.includes('--delete-drafts');
  
  migrateDraftsToCompanies(deleteDrafts)
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export default migrateDraftsToCompanies;