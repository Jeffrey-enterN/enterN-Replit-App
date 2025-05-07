import { Pool } from '@neondatabase/serverless';
import { db, pool } from '../server/db';
import { 
  companies, 
  employerProfiles, 
  employerProfileDrafts, 
  companyProfileDrafts,
  users
} from '../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Migration to merge employer_profiles into companies
 * 
 * This script:
 * 1. Finds all employer profiles
 * 2. For each employer profile, looks for an existing company or creates one
 * 3. Updates user records to link to the company
 * 4. Transfers employer profile drafts to company profile drafts where needed
 */
async function mergeEmployerToCompanyProfiles() {
  console.log('Starting migration to merge employer_profiles into companies...');
  
  try {
    // Find all employer profiles
    const employerProfilesList = await db.select().from(employerProfiles);
    console.log(`Found ${employerProfilesList.length} employer profiles to process`);

    for (const profile of employerProfilesList) {
      // Get associated user
      const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
      
      if (!user) {
        console.log(`No user found for employer profile with userId: ${profile.userId}`);
        continue;
      }
      
      console.log(`Processing employer profile for user ${user.username}`);
      
      // Check if there's already a company record for this user
      let companyId = user.companyId;
      let company;
      
      if (companyId) {
        // User already has a company, update it with any missing info
        [company] = await db.select().from(companies).where(eq(companies.id, companyId));
        
        if (company) {
          console.log(`User already associated with company ${company.name} (ID: ${company.id})`);
          
          // Update company with any additional info from employer profile
          await db.update(companies)
            .set({
              name: company.name || profile.companyName,
              website: company.website || profile.companyWebsite,
              headquarters: company.headquarters || profile.headquarters,
              yearFounded: company.yearFounded || profile.yearFounded,
              size: company.size || profile.companySize,
              about: company.about || profile.aboutCompany,
              mission: company.mission || profile.companyMission, 
              values: company.values || profile.companyValues,
              benefits: company.benefits || profile.benefits,
              additionalBenefits: company.additionalBenefits || profile.additionalBenefits,
              additionalOffices: company.additionalOffices || profile.additionalOffices,
              updatedAt: new Date()
            })
            .where(eq(companies.id, company.id));
            
          console.log(`Updated company record for ${company.name}`);
        }
      } else {
        // Create a new company record from the employer profile
        const [newCompany] = await db.insert(companies)
          .values({
            name: profile.companyName || user.companyName || "Unnamed Company",
            adminName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            adminEmail: user.email,
            website: profile.companyWebsite,
            headquarters: profile.headquarters,
            yearFounded: profile.yearFounded,
            size: profile.companySize,
            about: profile.aboutCompany,
            mission: profile.companyMission,
            values: profile.companyValues,
            benefits: profile.benefits,
            additionalBenefits: profile.additionalBenefits,
            additionalOffices: profile.additionalOffices
          })
          .returning();
          
        companyId = newCompany.id;
        company = newCompany;
        console.log(`Created new company record for ${company.name} (ID: ${company.id})`);
        
        // Update the user record with the company ID
        await db.update(users)
          .set({ 
            companyId: company.id,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
          
        console.log(`Updated user record with new company ID: ${company.id}`);
      }
      
      // Transfer any employer profile drafts to company profile drafts
      const employerDrafts = await db.select().from(employerProfileDrafts)
        .where(eq(employerProfileDrafts.userId, user.id));
        
      if (employerDrafts.length > 0) {
        console.log(`Found ${employerDrafts.length} employer profile drafts to transfer`);
        
        for (const draft of employerDrafts) {
          // Check if a company draft already exists
          const existingDrafts = await db.select().from(companyProfileDrafts)
            .where(
              and(
                eq(companyProfileDrafts.userId, user.id),
                eq(companyProfileDrafts.companyId, companyId)
              )
            );
            
          if (existingDrafts.length === 0) {
            // Create a new company profile draft
            await db.insert(companyProfileDrafts)
              .values({
                companyId: companyId,
                userId: user.id,
                draftData: draft.draftData,
                step: 1,
                draftType: "edit",
                lastActive: new Date()
              });
              
            console.log(`Created company profile draft for user ${user.id} and company ${companyId}`);
          } else {
            console.log(`Company profile draft already exists for user ${user.id} and company ${companyId}`);
          }
        }
      }
    }
    
    console.log('Migration completed successfully');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, message: error.message };
  }
}

// Execute the migration when this script is run directly
// For ESM compatibility
if (import.meta.url === `file://${process.argv[1]}`) {
  mergeEmployerToCompanyProfiles()
    .then((result) => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export default mergeEmployerToCompanyProfiles;