const { sql } = require('drizzle-orm');
const { pool } = require('../db');
const { drizzle } = require('drizzle-orm/neon-serverless');

async function updateSchema() {
  console.log('Starting schema update...');
  const db = drizzle(pool);

  try {
    // Add companies table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        website TEXT,
        headquarters TEXT,
        year_founded INTEGER,
        size TEXT,
        industry TEXT,
        about TEXT,
        additional_offices JSONB,
        mission TEXT,
        values TEXT,
        benefits JSONB,
        additional_benefits TEXT,
        logo TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created companies table');

    // Add company_id and company_role columns to users table
    try {
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id),
        ADD COLUMN IF NOT EXISTS company_role TEXT DEFAULT 'recruiter'
      `);
      console.log('Added company columns to users table');
    } catch (error) {
      console.error('Error adding company columns to users table:', error);
    }

    // Add company_id column to job_postings table
    try {
      await db.execute(sql`
        ALTER TABLE job_postings
        ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
      `);
      console.log('Added company_id column to job_postings table');
    } catch (error) {
      console.error('Error adding company_id to job_postings table:', error);
    }

    // Create company_invites table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS company_invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        role TEXT DEFAULT 'recruiter',
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created company_invites table');

    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

updateSchema().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});