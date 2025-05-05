import { db, pool } from '../server/db';
import { jobseekerProfiles, users } from '../shared/schema';
import { USER_TYPES } from '../client/src/lib/constants';
import { eq, and } from 'drizzle-orm';

async function cleanUpJobseekerProfiles() {
  try {
    console.log('Starting to clean up existing jobseeker profiles...');
    
    // Get all jobseeker users
    const jobseekerUsers = await db.select().from(users).where(eq(users.userType, USER_TYPES.JOBSEEKER));
    console.log(`Found ${jobseekerUsers.length} jobseeker users.`);
    
    // Keep a few special accounts (e.g., keep admin and test accounts)
    const specialUsernames = ['laniesmith', 'adminjobseeker', 'testjobseeker'];
    
    // Filter out special accounts
    const usersToDelete = jobseekerUsers.filter(user => 
      !specialUsernames.some(specialName => user.username?.toLowerCase().includes(specialName))
    );
    
    console.log(`Preparing to delete ${usersToDelete.length} jobseeker users and their profiles.`);
    
    // Delete each jobseeker profile
    for (const user of usersToDelete) {
      try {
        // Delete the jobseeker profile first
        const result = await db.delete(jobseekerProfiles).where(eq(jobseekerProfiles.userId, user.id));
        
        // Delete the user
        const userDelete = await db.delete(users).where(eq(users.id, user.id));
        
        console.log(`Deleted user ID ${user.id} (${user.username})`);
      } catch (error) {
        console.error(`Error deleting user ${user.id} (${user.username}):`, error);
      }
    }
    
    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Error cleaning up profiles:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
cleanUpJobseekerProfiles();