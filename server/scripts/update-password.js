import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import { hashPassword } from '../utils/auth-utils.js';
import { users } from '../../shared/schema.ts';

neonConfig.webSocketConstructor = ws;

async function updatePassword() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    console.log('Starting password update process...');
    
    // Update the password for test2@enter-n.com
    const username = 'test2@enter-n.com';
    const newPassword = 'Password123!';
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    console.log(`Password hashed successfully for ${username}`);
    
    // Update the user record
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username))
      .returning();
    
    if (result.length > 0) {
      console.log(`Password updated successfully for user: ${username}`);
    } else {
      console.log(`No user found with username: ${username}`);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updatePassword();