/**
 * Migration script to merge employer_profiles into companies
 * 
 * This script:
 * 1. Finds all employer profiles
 * 2. For each employer profile, looks for an existing company or creates one
 * 3. Updates user records to link to the company
 * 4. Transfers employer profile drafts to company profile drafts where needed
 */

import { db, pool } from '../server/db';
import { 
  users,
  companies,
  employerProfiles,
  employerProfileDrafts,
  companyProfileDrafts
} from '../shared/schema';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';

async function mergeEmployerToCompanyProfiles() {
  console.log('Starting migration of employer profiles to company profiles...');
  
  try {
    // Get all employer profiles
    const profiles = await db.select().from(employerProfiles);
    
    console.log(`Found ${profiles.length} employer profiles to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Migrate each profile
    for (const profile of profiles) {
      try {
        console.log(`Processing employer profile ID: ${profile.id} for user ID: ${profile.userId}`);
        
        // Get the user associated with this profile
        const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
        
        if (!user) {
          console.log(`No user found for profile ID: ${profile.id}, skipping`);
          skippedCount++;
          continue;
        }
        
        // Check if the user already has a company
        if (user.companyId) {
          // Update existing company with employer profile data
          const [existingCompany] = await db.select().from(companies).where(eq(companies.id, user.companyId));
          
          if (existingCompany) {
            console.log(`User ${user.id} already has company ID: ${existingCompany.id}, updating with employer profile data`);
            
            const [updatedCompany] = await db
              .update(companies)
              .set({
                name: profile.companyName || existingCompany.name,
                about: profile.aboutCompany || existingCompany.about,
                industries: profile.companyIndustry ? [profile.companyIndustry] : existingCompany.industries,
                size: profile.companySize || existingCompany.size,
                yearFounded: profile.yearFounded || existingCompany.yearFounded,
                additionalOffices: profile.additionalOffices || existingCompany.additionalOffices,
                workArrangements: profile.additionalOffices ? profile.additionalOffices : existingCompany.workArrangements,
                website: profile.companyWebsite || existingCompany.website,
                logo: existingCompany.logo,
                values: profile.companyValues || existingCompany.values,
                benefits: profile.benefits || existingCompany.benefits,
                updatedAt: new Date()
              })
              .where(eq(companies.id, existingCompany.id))
              .returning();
            
            console.log(`Updated company ID: ${updatedCompany.id} with employer profile data`);
            migratedCount++;
          } else {
            console.log(`User ${user.id} has companyId ${user.companyId} but company not found, creating new company`);
            
            // Create a new company with employer profile data
            const [newCompany] = await db
              .insert(companies)
              .values({
                name: profile.companyName || user.companyName || 'Unnamed Company',
                about: profile.aboutCompany || null,
                industries: profile.companyIndustry ? [profile.companyIndustry] : [],
                size: profile.companySize || null,
                yearFounded: profile.yearFounded || null,
                additionalOffices: profile.additionalOffices || [],
                workArrangements: [],
                website: profile.companyWebsite || null,
                logo: null,
                mission: profile.companyMission || null,
                values: profile.companyValues || null,
                benefits: profile.benefits || null,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();
            
            console.log(`Created new company ID: ${newCompany.id} for user ${user.id}`);
            
            // Update the user record with the new company ID
            await db
              .update(users)
              .set({
                companyId: newCompany.id,
                companyRole: 'admin',
                updatedAt: new Date()
              })
              .where(eq(users.id, user.id));
            
            console.log(`Updated user ${user.id} with new company ID: ${newCompany.id}`);
            migratedCount++;
          }
        } else {
          // User doesn't have a company, create one
          console.log(`User ${user.id} doesn't have a company, creating new company`);
          
          const [newCompany] = await db
            .insert(companies)
            .values({
              name: profile.companyName || user.companyName || 'Unnamed Company',
              about: profile.aboutCompany || null,
              industries: profile.companyIndustry ? [profile.companyIndustry] : [],
              size: profile.companySize || null,
              yearFounded: profile.yearFounded || null,
              additionalOffices: profile.additionalOffices || [],
              workArrangements: [],
              website: profile.companyWebsite || null,
              logo: null,
              mission: profile.companyMission || null,
              values: profile.companyValues || null,
              benefits: profile.benefits || null,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          console.log(`Created new company ID: ${newCompany.id} for user ${user.id}`);
          
          // Update the user record with the new company ID
          await db
            .update(users)
            .set({
              companyId: newCompany.id,
              companyRole: 'admin',
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
          
          console.log(`Updated user ${user.id} with new company ID: ${newCompany.id}`);
          migratedCount++;
        }
        
        // Check if there are any employer profile drafts
        const employerDrafts = await db
          .select()
          .from(employerProfileDrafts)
          .where(eq(employerProfileDrafts.userId, user.id));
        
        if (employerDrafts.length > 0) {
          console.log(`Found ${employerDrafts.length} employer profile drafts for user ${user.id}, migrating to company profile drafts`);
          
          // For each draft, create a company profile draft
          for (const draft of employerDrafts) {
            const [companyDraft] = await db
              .insert(companyProfileDrafts)
              .values({
                userId: user.id,
                companyId: user.companyId,
                draftData: {
                  name: draft.draftData.companyName || user.companyName || 'Unnamed Company',
                  about: draft.draftData.aboutCompany || null,
                  industries: draft.draftData.companyIndustry ? [draft.draftData.companyIndustry] : [],
                  size: draft.draftData.companySize || null,
                  yearFounded: draft.draftData.yearFounded || null,
                  additionalOffices: draft.draftData.additionalOffices || [],
                  workArrangements: [],
                  website: draft.draftData.companyWebsite || null,
                  logo: null,
                  mission: draft.draftData.companyMission || null,
                  values: draft.draftData.companyValues || null,
                  benefits: draft.draftData.benefits || null
                },
                createdAt: draft.createdAt,
                updatedAt: new Date()
              })
              .returning();
            
            console.log(`Created company profile draft ID: ${companyDraft.id} from employer profile draft ID: ${draft.id}`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error migrating employer profile ID: ${profile.id}:`, errorMessage);
        errorCount++;
      }
    }
    
    console.log(`Migration completed with: 
- ${migratedCount} employer profiles successfully migrated to companies
- ${skippedCount} employer profiles skipped
- ${errorCount} errors encountered`);
    
    return { 
      success: true,
      migratedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during migration:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Run the migration if this script is executed directly
const isMainModule = process.argv[1]?.endsWith('scripts/merge-employer-company.ts');

if (isMainModule) {
  mergeEmployerToCompanyProfiles()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export default mergeEmployerToCompanyProfiles;