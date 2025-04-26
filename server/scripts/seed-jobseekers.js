const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq } = require('drizzle-orm');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');
const { hashPassword } = require('../utils/auth-utils');

neonConfig.webSocketConstructor = ws;

const JOBSEEKERS = [
  {
    firstName: 'Emma',
    lastName: 'Thompson',
    username: 'business1@example.com',
    major: 'Business',
    degreeLevel: 'Bachelor\'s',
    school: 'University of Michigan',
    phone: '555-111-2222',
    sliderValues: {
      'work-pace': 70,
      'office-atmosphere': 80,
      'team-composition': 75,
      'feedback-style': 65,
      'management-style': 60,
      'remote-flex': 85,
      'work-life-balance': 90,
      'innovation-importance': 70,
      'autonomy-level': 75
    },
    locationPreferences: ['New York, NY', 'Chicago, IL', 'Boston, MA'],
    workArrangements: ['hybrid', 'remote'],
    industryPreferences: ['Finance', 'Technology', 'Consulting']
  },
  {
    firstName: 'Noah',
    lastName: 'Chen',
    username: 'chemistry@example.com',
    major: 'Chemistry',
    degreeLevel: 'PhD',
    school: 'Stanford University',
    phone: '555-222-3333',
    sliderValues: {
      'work-pace': 75,
      'office-atmosphere': 60,
      'team-composition': 80,
      'feedback-style': 75,
      'management-style': 70,
      'remote-flex': 50,
      'work-life-balance': 65,
      'innovation-importance': 95,
      'autonomy-level': 85
    },
    locationPreferences: ['San Francisco, CA', 'Boston, MA', 'Seattle, WA'],
    workArrangements: ['onsite', 'hybrid'],
    industryPreferences: ['Pharmaceuticals', 'Biotechnology', 'Healthcare']
  },
  {
    firstName: 'Oliver',
    lastName: 'Wang',
    username: 'computerscience@example.com',
    major: 'Computer Science',
    degreeLevel: 'Master\'s',
    school: 'MIT',
    phone: '555-333-4444',
    sliderValues: {
      'work-pace': 80,
      'office-atmosphere': 75,
      'team-composition': 85,
      'feedback-style': 80,
      'management-style': 60,
      'remote-flex': 95,
      'work-life-balance': 85,
      'innovation-importance': 90,
      'autonomy-level': 90
    },
    locationPreferences: ['San Francisco, CA', 'Seattle, WA', 'Austin, TX'],
    workArrangements: ['remote', 'hybrid'],
    industryPreferences: ['Technology', 'Software', 'Artificial Intelligence']
  },
  {
    firstName: 'Ava',
    lastName: 'Garcia',
    username: 'marketing@example.com',
    major: 'Marketing',
    degreeLevel: 'Bachelor\'s',
    school: 'New York University',
    phone: '555-444-5555',
    sliderValues: {
      'work-pace': 85,
      'office-atmosphere': 90,
      'team-composition': 80,
      'feedback-style': 75,
      'management-style': 70,
      'remote-flex': 80,
      'work-life-balance': 75,
      'innovation-importance': 85,
      'autonomy-level': 70
    },
    locationPreferences: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL'],
    workArrangements: ['hybrid', 'onsite'],
    industryPreferences: ['Advertising', 'Media', 'Entertainment']
  },
  {
    firstName: 'William',
    lastName: 'Johnson',
    username: 'finance@example.com',
    major: 'Finance',
    degreeLevel: 'Master\'s',
    school: 'Columbia University',
    phone: '555-555-6666',
    sliderValues: {
      'work-pace': 90,
      'office-atmosphere': 70,
      'team-composition': 75,
      'feedback-style': 85,
      'management-style': 80,
      'remote-flex': 60,
      'work-life-balance': 65,
      'innovation-importance': 75,
      'autonomy-level': 65
    },
    locationPreferences: ['New York, NY', 'Chicago, IL', 'Charlotte, NC'],
    workArrangements: ['onsite', 'hybrid'],
    industryPreferences: ['Finance', 'Banking', 'Investment Management']
  },
  {
    firstName: 'Sophia',
    lastName: 'Kim',
    username: 'electrical@example.com',
    major: 'Electrical Engineering',
    degreeLevel: 'Bachelor\'s',
    school: 'Georgia Tech',
    phone: '555-666-7777',
    sliderValues: {
      'work-pace': 75,
      'office-atmosphere': 65,
      'team-composition': 80,
      'feedback-style': 70,
      'management-style': 65,
      'remote-flex': 75,
      'work-life-balance': 80,
      'innovation-importance': 95,
      'autonomy-level': 80
    },
    locationPreferences: ['Atlanta, GA', 'Austin, TX', 'Denver, CO'],
    workArrangements: ['hybrid', 'onsite'],
    industryPreferences: ['Technology', 'Manufacturing', 'Energy']
  },
  {
    firstName: 'James',
    lastName: 'Smith',
    username: 'business2@example.com',
    major: 'Business',
    degreeLevel: 'Bachelor\'s',
    school: 'University of Texas',
    phone: '555-777-8888',
    sliderValues: {
      'work-pace': 80,
      'office-atmosphere': 85,
      'team-composition': 75,
      'feedback-style': 70,
      'management-style': 75,
      'remote-flex': 70,
      'work-life-balance': 80,
      'innovation-importance': 75,
      'autonomy-level': 70
    },
    locationPreferences: ['Austin, TX', 'Dallas, TX', 'Houston, TX'],
    workArrangements: ['hybrid', 'onsite'],
    industryPreferences: ['Consulting', 'Real Estate', 'Energy']
  },
  {
    firstName: 'Charlotte',
    lastName: 'Davis',
    username: 'history@example.com',
    major: 'History',
    degreeLevel: 'Master\'s',
    school: 'Yale University',
    phone: '555-888-9999',
    sliderValues: {
      'work-pace': 65,
      'office-atmosphere': 80,
      'team-composition': 75,
      'feedback-style': 85,
      'management-style': 80,
      'remote-flex': 85,
      'work-life-balance': 90,
      'innovation-importance': 70,
      'autonomy-level': 75
    },
    locationPreferences: ['Boston, MA', 'New York, NY', 'Washington, DC'],
    workArrangements: ['remote', 'hybrid'],
    industryPreferences: ['Education', 'Publishing', 'Non-profit']
  },
  {
    firstName: 'Benjamin',
    lastName: 'Wilson',
    username: 'prelaw@example.com',
    major: 'Pre-Law',
    degreeLevel: 'Bachelor\'s',
    school: 'Georgetown University',
    phone: '555-999-0000',
    sliderValues: {
      'work-pace': 85,
      'office-atmosphere': 75,
      'team-composition': 70,
      'feedback-style': 80,
      'management-style': 75,
      'remote-flex': 60,
      'work-life-balance': 70,
      'innovation-importance': 65,
      'autonomy-level': 60
    },
    locationPreferences: ['Washington, DC', 'New York, NY', 'Chicago, IL'],
    workArrangements: ['onsite', 'hybrid'],
    industryPreferences: ['Legal Services', 'Consulting', 'Government']
  },
  {
    firstName: 'Mia',
    lastName: 'Brown',
    username: 'business3@example.com',
    major: 'Business',
    degreeLevel: 'Master\'s',
    school: 'University of Chicago',
    phone: '555-000-1111',
    sliderValues: {
      'work-pace': 80,
      'office-atmosphere': 75,
      'team-composition': 85,
      'feedback-style': 75,
      'management-style': 70,
      'remote-flex': 75,
      'work-life-balance': 75,
      'innovation-importance': 80,
      'autonomy-level': 75
    },
    locationPreferences: ['Chicago, IL', 'New York, NY', 'San Francisco, CA'],
    workArrangements: ['hybrid', 'remote'],
    industryPreferences: ['Finance', 'Consulting', 'Technology']
  }
];

const DEFAULT_PASSWORD = 'Password123!';

async function seedJobseekers() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    const { users, jobseekerProfiles } = require('../../shared/schema');

    console.log('Starting jobseeker seed process...');
    
    // 1. Hash password once to reuse (all test accounts will have same password)
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    console.log('Password hashed successfully');

    // 2. Create user accounts and profiles for each jobseeker
    for (const jobseeker of JOBSEEKERS) {
      console.log(`Creating jobseeker: ${jobseeker.firstName} ${jobseeker.lastName}`);
      
      // Check if user already exists
      const existingUsers = await db.select().from(users).where(eq(users.username, jobseeker.username));
      
      if (existingUsers.length > 0) {
        console.log(`User ${jobseeker.username} already exists, skipping...`);
        continue;
      }
      
      // Create user
      const [user] = await db.insert(users).values({
        username: jobseeker.username,
        password: hashedPassword,
        userType: 'jobseeker',
        email: jobseeker.username,
        firstName: jobseeker.firstName,
        lastName: jobseeker.lastName,
        companyName: null,
        phone: jobseeker.phone,
      }).returning();
      
      console.log(`Created user ID: ${user.id} for ${jobseeker.firstName} ${jobseeker.lastName}`);
      
      // Create jobseeker profile
      const [profile] = await db.insert(jobseekerProfiles).values({
        userId: user.id,
        firstName: jobseeker.firstName,
        lastName: jobseeker.lastName,
        email: jobseeker.username,
        phone: jobseeker.phone,
        schoolEmail: `${jobseeker.firstName.toLowerCase()}.${jobseeker.lastName.toLowerCase()}@student.${jobseeker.school.toLowerCase().replace(/\s+/g, '')}.edu`,
        school: jobseeker.school,
        degreeLevel: jobseeker.degreeLevel,
        major: jobseeker.major,
        portfolioUrl: null,
        preferredLocations: jobseeker.locationPreferences,
        workArrangements: jobseeker.workArrangements,
        industryPreferences: jobseeker.industryPreferences,
        functionalPreferences: '',
        sliderValues: jobseeker.sliderValues
      }).returning();
      
      console.log(`Created profile for ${jobseeker.firstName} ${jobseeker.lastName}`);
    }
    
    console.log('Seed completed successfully');
    await pool.end();
    
  } catch (error) {
    console.error('Error seeding jobseekers:', error);
    process.exit(1);
  }
}

seedJobseekers();