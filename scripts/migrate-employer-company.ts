import mergeEmployerToCompanyProfiles from '../migrations/merge-employer-company';
import removeEmployerTables from '../migrations/remove-employer-tables';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

// For ESM compatibility
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Create interface for readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask for confirmation
const confirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
};

/**
 * Migration script to consolidate employer and company tables
 * 
 * This script:
 * 1. Merges employer_profiles data into companies
 * 2. Updates schema.ts to remove employer_profiles and employer_profile_drafts tables
 * 3. Removes the actual database tables
 */
async function migrateEmployerCompany() {
  console.log('========================================');
  console.log('COMPANY/EMPLOYER MIGRATION UTILITY');
  console.log('========================================');
  console.log('This script will:');
  console.log('1. Merge employer_profiles data into companies');
  console.log('2. Update schema.ts to comment out employer_profiles and employer_profile_drafts tables');
  console.log('3. Remove the employer_profiles and employer_profile_drafts tables from the database');
  console.log('\nIMPORTANT: This is a destructive operation. Make sure you have a backup of your database.');
  console.log('========================================\n');
  
  const continueConfirmation = await confirm('Do you want to continue?');
  if (!continueConfirmation) {
    console.log('Migration aborted by user.');
    rl.close();
    return;
  }
  
  try {
    // Step 1: Merge employer_profiles into companies
    console.log('\n=== STEP 1: Merging employer_profiles into companies ===');
    const mergeResult = await mergeEmployerToCompanyProfiles();
    
    if (!mergeResult.success) {
      console.error('Error during data migration:', mergeResult.message);
      rl.close();
      return;
    }
    
    console.log('✅ Data migration completed successfully');
    
    // Step 2: Update schema.ts to comment out employer_profiles and employer_profile_drafts tables
    console.log('\n=== STEP 2: Updating schema.ts to comment out employer tables ===');
    const schemaConfirmation = await confirm('Update schema.ts to comment out employer tables?');
    
    if (schemaConfirmation) {
      try {
        // Path to schema.ts
        const schemaPath = resolve(__dirname, '../shared/schema.ts');
        let schemaContent = readFileSync(schemaPath, 'utf-8');
        
        // Comment out employerProfiles table
        schemaContent = schemaContent.replace(
          /export const employerProfiles = pgTable\("employer_profiles",/g, 
          '/* DEPRECATED - Merged into companies table */\n// export const employerProfiles = pgTable("employer_profiles",'
        );
        
        // Comment out employerProfilesRelations
        schemaContent = schemaContent.replace(
          /export const employerProfilesRelations = relations\(employerProfiles,/g, 
          '/* DEPRECATED - Merged into companies table */\n// export const employerProfilesRelations = relations(employerProfiles,'
        );
        
        // Comment out employerProfileDrafts table
        schemaContent = schemaContent.replace(
          /export const employerProfileDrafts = pgTable\("employer_profile_drafts",/g, 
          '/* DEPRECATED - Merged into company_profile_drafts table */\n// export const employerProfileDrafts = pgTable("employer_profile_drafts",'
        );
        
        // Comment out employerProfileDraftsRelations
        schemaContent = schemaContent.replace(
          /export const employerProfileDraftsRelations = relations\(employerProfileDrafts,/g, 
          '/* DEPRECATED - Merged into company_profile_drafts table */\n// export const employerProfileDraftsRelations = relations(employerProfileDrafts,'
        );
        
        // Update imports to keep type definitions but reference them to avoid errors
        // Add at the top of the file after the imports
        const typeAlias = `
// Type aliases for backward compatibility after employer-company merge
export type EmployerProfile = Company;
export type InsertEmployerProfile = InsertCompany;
export type EmployerProfileDraft = CompanyProfileDraft;
export type InsertEmployerProfileDraft = InsertCompanyProfileDraft;
`;
        
        // Insert the type alias after the imports
        const importsEnd = schemaContent.indexOf('export const USER_TYPES');
        if (importsEnd > 0) {
          schemaContent = 
            schemaContent.substring(0, importsEnd) + 
            typeAlias + 
            schemaContent.substring(importsEnd);
        }
        
        // Write the updated schema content
        writeFileSync(schemaPath, schemaContent, 'utf-8');
        console.log('✅ Schema updated successfully');
      } catch (error) {
        console.error('Error updating schema.ts:', error);
        rl.close();
        return;
      }
    } else {
      console.log('Schema update skipped');
    }
    
    // Step 3: Remove the employer_profiles and employer_profile_drafts tables
    console.log('\n=== STEP 3: Removing employer_profiles and employer_profile_drafts tables ===');
    const tableRemovalConfirmation = await confirm('Remove employer_profiles and employer_profile_drafts tables from the database?');
    
    if (tableRemovalConfirmation) {
      const removalResult = await removeEmployerTables();
      
      if (!removalResult.success) {
        console.error('Error during table removal:', removalResult.message);
        rl.close();
        return;
      }
      
      console.log('✅ Tables removed successfully');
    } else {
      console.log('Table removal skipped');
    }
    
    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
    console.log('Next steps:');
    console.log('1. Update storage.ts to use the new company methods instead of employer methods');
    console.log('2. Update routes.ts to use the new company routes instead of employer routes');
    console.log('3. Update client code to use the new API endpoints');
    
  } catch (error) {
    console.error('Unhandled error during migration:', error);
  } finally {
    rl.close();
  }
}

// Run the migration
migrateEmployerCompany();