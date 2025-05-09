import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const scryptAsync = promisify(scrypt);

// Default password for all test accounts
const DEFAULT_PASSWORD = 'Password123!';

// Hash password using scrypt (same as in auth.ts)
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// List of 35 companies
const sampleCompanies = [
  {
    name: "TechInnovate Solutions",
    industries: ["Technology", "Software Development"],
    size: "51-200",
    headquarters: "Chicago, IL",
    description: "TechInnovate Solutions creates cutting-edge software solutions for businesses of all sizes.",
    jobs: [
      {
        title: "Software Engineering Intern",
        description: "Join our team to develop innovative software solutions using modern technologies.",
        location: "Chicago, IL",
        workType: ["Remote", "Hybrid"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "UX Design Intern",
        description: "Work with our design team to create beautiful and functional user interfaces.",
        location: "Chicago, IL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Design"
      }
    ]
  },
  // Adding just one company for testing - we can add more once this works
];

async function seedCompaniesDirectly() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    console.log('Connecting to database using direct connection...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // May be needed for some Postgres instances
      }
    });

    console.log('Testing connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connection successful, server time:', testResult.rows[0].now);
    
    // Hash password once to reuse for all company admin accounts
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    
    // Keep track of how many companies and jobs were created
    let companiesCreated = 0;
    let jobsCreated = 0;

    // Process each company in the list
    for (const companyData of sampleCompanies) {
      try {
        console.log(`Creating company: ${companyData.name}`);
        
        // 1. Create company admin user
        const username = `admin_${companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}@example.com`;
        
        // Check if user already exists
        const userCheckResult = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
        );
        
        let userId: number;
        
        if (userCheckResult.rows.length > 0) {
          userId = userCheckResult.rows[0].id;
          console.log(`  User already exists: ${username} (ID: ${userId})`);
        } else {
          // Create new user
          const userResult = await pool.query(
            'INSERT INTO users (username, password, user_type, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [username, hashedPassword, 'employer', 'Admin', companyData.name, username]
          );
          
          userId = userResult.rows[0].id;
          console.log(`  Created user: ${username} (ID: ${userId})`);
        }
        
        // 2. Create or update company
        const companyResult = await pool.query(
          'INSERT INTO companies (name, admin_name, admin_email, headquarters, size, industries, about, work_arrangements, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
          [
            companyData.name, 
            'Admin', 
            username, 
            companyData.headquarters, 
            companyData.size, 
            JSON.stringify(companyData.industries), 
            companyData.description,
            JSON.stringify(['Remote', 'Hybrid', 'On-site']),
            true
          ]
        );
        
        const companyId = companyResult.rows[0].id;
        console.log(`  Created company: ${companyData.name} (ID: ${companyId})`);
        companiesCreated++;
        
        // 3. Link user to company
        await pool.query(
          'UPDATE users SET company_id = $1, company_role = $2 WHERE id = $3',
          [companyId, 'admin', userId]
        );
        
        console.log(`  Linked user ${userId} to company ${companyId} as admin`);
        
        // 4. Create job postings for this company
        for (const jobData of companyData.jobs) {
          const jobId = uuidv4();
          await pool.query(
            'INSERT INTO job_postings (id, title, description, location, "workType", "employmentType", department, "companyId", status, "employerId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
              jobId,
              jobData.title,
              jobData.description,
              jobData.location,
              JSON.stringify(jobData.workType),
              jobData.employmentType,
              jobData.department,
              companyId,
              'active',
              userId
            ]
          );
          
          console.log(`  Created job: ${jobData.title} (ID: ${jobId})`);
          jobsCreated++;
        }
      } catch (error) {
        console.error(`Error creating company ${companyData.name}:`, error);
        // Continue with the next company
      }
    }
    
    console.log('Seed completed successfully');
    console.log(`Created ${companiesCreated} companies and ${jobsCreated} job postings`);
    
    // Close the connection
    await pool.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedCompaniesDirectly().catch(console.error);