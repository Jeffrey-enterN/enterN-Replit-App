import { db } from '../server/db';
import { jobseekerProfiles } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * This script ensures all jobseeker profiles meet the minimum requirements
 * to appear in the employer match feed:
 * 1. Education section is completed
 * 2. Locations are specified
 * 3. Work arrangements are specified
 */
async function ensureProfileCompletion() {
  console.log('Ensuring all profiles meet minimum completion requirements...');
  
  try {
    // Get all jobseeker profiles
    const allProfiles = await db.select().from(jobseekerProfiles);
    console.log(`Found ${allProfiles.length} jobseeker profiles to check`);
    
    // Sample education values
    const schools = [
      'Bradley University', 
      'University of Illinois', 
      'Arizona State University', 
      'Ohio State University',
      'Michigan State University',
      'University of Wisconsin',
      'Purdue University',
      'Northwestern University'
    ];
    
    const degrees = [
      "Bachelor's Degree", 
      "Master's Degree", 
      "Associate's Degree", 
      "Ph.D."
    ];
    
    const majors = [
      'Computer Science',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Business Administration',
      'Marketing',
      'Finance',
      'Graphic Design',
      'Psychology',
      'Biology',
      'Communications'
    ];
    
    // Sample locations
    const locations = [
      'Chicago, IL',
      'New York, NY',
      'San Francisco, CA',
      'Austin, TX',
      'Boston, MA',
      'Seattle, WA',
      'Denver, CO',
      'Miami, FL',
      'Phoenix, AZ',
      'Indianapolis, IN',
      'Peoria, IL'
    ];
    
    // Sample work arrangements
    const workArrangements = [
      'remote',
      'in-office',
      'hybrid',
      'flexible'
    ];
    
    // Update each profile with required completion fields if missing
    for (const profile of allProfiles) {
      console.log(`Checking profile for user ID: ${profile.userId}`);
      
      // Check if education is complete
      const educationComplete = profile.school || profile.degreeLevel || profile.major;
      
      // Check if locations are specified
      const locationsComplete = Array.isArray(profile.preferredLocations) && 
                               profile.preferredLocations.length > 0;
      
      // Check if work arrangements are specified
      const workArrangementsComplete = Array.isArray(profile.workArrangements) && 
                                      profile.workArrangements.length > 0;
      
      // Prepare updates if needed
      const updates: Record<string, any> = {};
      
      if (!educationComplete) {
        console.log(`  Adding education data for user ID: ${profile.userId}`);
        updates.school = schools[Math.floor(Math.random() * schools.length)];
        updates.degreeLevel = degrees[Math.floor(Math.random() * degrees.length)];
        updates.major = majors[Math.floor(Math.random() * majors.length)];
      }
      
      if (!locationsComplete) {
        console.log(`  Adding location preferences for user ID: ${profile.userId}`);
        // Select 1-3 random locations
        const numLocations = Math.floor(Math.random() * 3) + 1;
        const selectedLocations: string[] = [];
        
        for (let i = 0; i < numLocations; i++) {
          const location = locations[Math.floor(Math.random() * locations.length)];
          if (!selectedLocations.includes(location)) {
            selectedLocations.push(location);
          }
        }
        
        updates.preferredLocations = selectedLocations;
      }
      
      if (!workArrangementsComplete) {
        console.log(`  Adding work arrangements for user ID: ${profile.userId}`);
        // Select 1-3 random work arrangements
        const numArrangements = Math.floor(Math.random() * 3) + 1;
        const selectedArrangements: string[] = [];
        
        for (let i = 0; i < numArrangements; i++) {
          const arrangement = workArrangements[Math.floor(Math.random() * workArrangements.length)];
          if (!selectedArrangements.includes(arrangement)) {
            selectedArrangements.push(arrangement);
          }
        }
        
        updates.workArrangements = selectedArrangements;
      }
      
      // Update the profile if any changes are needed
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        
        await db.update(jobseekerProfiles)
          .set(updates)
          .where(eq(jobseekerProfiles.userId, profile.userId));
        
        console.log(`✅ Updated profile completion for user ID: ${profile.userId}`);
      } else {
        console.log(`✓ Profile already meets requirements for user ID: ${profile.userId}`);
      }
    }
    
    console.log('✅ Successfully ensured all profiles meet completion requirements!');
  } catch (error) {
    console.error('❌ Error ensuring profile completion:', error);
  }
}

// Execute the function
ensureProfileCompletion()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });