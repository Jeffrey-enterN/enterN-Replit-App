import { db } from '../server/db';
import { jobseekerProfiles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { SLIDER_CATEGORIES } from '../client/src/lib/constants';

/**
 * This script updates all jobseeker profiles with randomized slider values
 * to provide a more realistic demo experience in the employer match feed.
 */
async function randomizeJobseekerSliders() {
  console.log('Starting to randomize jobseeker sliders...');
  
  try {
    // Get all jobseeker profiles
    const allProfiles = await db.select().from(jobseekerProfiles);
    console.log(`Found ${allProfiles.length} jobseeker profiles to update`);
    
    // Collect all possible slider IDs from slider categories
    const allSliderIds: string[] = [];
    SLIDER_CATEGORIES.forEach(category => {
      category.sliders.forEach(slider => {
        allSliderIds.push(slider.id);
      });
    });
    
    console.log(`Found ${allSliderIds.length} slider IDs from categories`);
    
    // Update each profile with randomized slider values
    for (const profile of allProfiles) {
      console.log(`Updating profile for user ID: ${profile.userId}`);
      
      // Create an object with randomized values for all sliders
      const randomizedSliderValues: Record<string, number> = {};
      allSliderIds.forEach(sliderId => {
        // Generate a random value between 1 and 100
        randomizedSliderValues[sliderId] = Math.floor(Math.random() * 100) + 1;
      });
      
      // Update the profile with the new slider values
      await db.update(jobseekerProfiles)
        .set({ 
          sliderValues: randomizedSliderValues,
          updatedAt: new Date()
        })
        .where(eq(jobseekerProfiles.userId, profile.userId));
      
      console.log(`✅ Updated sliders for user ID: ${profile.userId}`);
    }
    
    console.log('✅ Successfully randomized all jobseeker sliders!');
  } catch (error) {
    console.error('❌ Error randomizing jobseeker sliders:', error);
  }
}

// Execute the function
randomizeJobseekerSliders()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });