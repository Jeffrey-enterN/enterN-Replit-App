import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import { hashPassword } from '../utils/auth-utils.js';
import { users, employerProfiles } from '../../shared/schema.js';

neonConfig.webSocketConstructor = ws;

const COMPANIES = [
  {
    name: 'Acme Co.',
    username: 'acmeco@example.com',
    contactName: 'John Smith',
    phone: '555-123-4567',
    companySize: 'medium',
    industry: 'Technology',
    description: 'Acme Co. is a leading provider of innovative tech solutions for businesses of all sizes. We specialize in custom software development, cloud solutions, and digital transformation.',
    locations: ['New York, NY', 'Boston, MA'],
    workArrangements: ['hybrid', 'remote'],
    benefits: ['health insurance', 'retirement plan', '401k matching', 'unlimited PTO'],
    sliderValues: {
      'work-pace': 75,
      'office-atmosphere': 80,
      'team-composition': 70,
      'feedback-style': 65,
      'management-style': 60,
      'remote-flex': 90,
      'work-life-balance': 85,
      'innovation-importance': 95,
      'autonomy-level': 75
    }
  },
  {
    name: 'Test Inc.',
    username: 'testinc@example.com',
    contactName: 'Sarah Johnson',
    phone: '555-234-5678',
    companySize: 'large',
    industry: 'Finance',
    description: 'Test Inc. is a global financial services firm offering banking, investment, and asset management solutions. We help individuals and businesses manage their finances with integrity and innovation.',
    locations: ['Chicago, IL', 'Charlotte, NC'],
    workArrangements: ['onsite', 'hybrid'],
    benefits: ['comprehensive health insurance', 'generous vacation policy', 'wellness programs', 'professional development'],
    sliderValues: {
      'work-pace': 85,
      'office-atmosphere': 70,
      'team-composition': 80,
      'feedback-style': 75,
      'management-style': 70,
      'remote-flex': 60,
      'work-life-balance': 65,
      'innovation-importance': 75,
      'autonomy-level': 60
    }
  },
  {
    name: 'CheckIT Twice',
    username: 'checkit@example.com',
    contactName: 'Robert Chen',
    phone: '555-345-6789',
    companySize: 'small',
    industry: 'Information Technology',
    description: 'CheckIT Twice provides quality assurance and software testing services. Our meticulous approach ensures that your software meets the highest standards of quality and reliability.',
    locations: ['Austin, TX', 'Denver, CO'],
    workArrangements: ['remote', 'hybrid'],
    benefits: ['flexible work hours', 'remote work stipend', 'career development', 'health benefits'],
    sliderValues: {
      'work-pace': 70,
      'office-atmosphere': 90,
      'team-composition': 85,
      'feedback-style': 90,
      'management-style': 85,
      'remote-flex': 95,
      'work-life-balance': 90,
      'innovation-importance': 80,
      'autonomy-level': 85
    }
  },
  {
    name: 'Demo Place',
    username: 'demoplace@example.com',
    contactName: 'Maria Garcia',
    phone: '555-456-7890',
    companySize: 'micro',
    industry: 'Education',
    description: 'Demo Place creates interactive educational content and learning platforms. We believe in making education accessible, engaging, and effective for learners of all ages.',
    locations: ['Portland, OR', 'Seattle, WA'],
    workArrangements: ['hybrid', 'flexible'],
    benefits: ['continued education support', 'parental leave', 'volunteer time off', 'pet-friendly office'],
    sliderValues: {
      'work-pace': 60,
      'office-atmosphere': 95,
      'team-composition': 90,
      'feedback-style': 85,
      'management-style': 90,
      'remote-flex': 80,
      'work-life-balance': 95,
      'innovation-importance': 90,
      'autonomy-level': 90
    }
  },
  {
    name: 'Fake Companies',
    username: 'fakecompanies@example.com',
    contactName: 'David Wilson',
    phone: '555-567-8901',
    companySize: 'medium',
    industry: 'Marketing',
    description: 'Fake Companies offers innovative marketing strategies and creative branding solutions. Our data-driven approach helps businesses reach their target audience and achieve their marketing goals.',
    locations: ['Miami, FL', 'Atlanta, GA'],
    workArrangements: ['onsite', 'hybrid'],
    benefits: ['performance bonuses', 'generous vacation', 'gym membership', 'catered lunches'],
    sliderValues: {
      'work-pace': 90,
      'office-atmosphere': 85,
      'team-composition': 75,
      'feedback-style': 70,
      'management-style': 65,
      'remote-flex': 65,
      'work-life-balance': 70,
      'innovation-importance': 95,
      'autonomy-level': 80
    }
  },
  {
    name: 'Test Co.',
    username: 'testco@example.com',
    contactName: 'Michael Brown',
    phone: '555-678-9012',
    companySize: 'large',
    industry: 'Healthcare',
    description: 'Test Co. develops innovative healthcare solutions to improve patient outcomes and streamline clinical workflows. Our products combine medical expertise with cutting-edge technology.',
    locations: ['San Francisco, CA', 'Boston, MA'],
    workArrangements: ['hybrid', 'remote'],
    benefits: ['medical, dental & vision', 'wellness program', 'generous PTO', 'professional development'],
    sliderValues: {
      'work-pace': 80,
      'office-atmosphere': 75,
      'team-composition': 85,
      'feedback-style': 80,
      'management-style': 75,
      'remote-flex': 75,
      'work-life-balance': 80,
      'innovation-importance': 90,
      'autonomy-level': 70
    }
  },
  {
    name: 'Acme Inc.',
    username: 'acmeinc@example.com',
    contactName: 'Jennifer Lee',
    phone: '555-789-0123',
    companySize: 'small',
    industry: 'Manufacturing',
    description: 'Acme Inc. specializes in precision manufacturing and engineering solutions. Our commitment to quality and innovation has made us a trusted partner for businesses across various industries.',
    locations: ['Detroit, MI', 'Cleveland, OH'],
    workArrangements: ['onsite', 'hybrid'],
    benefits: ['competitive salary', 'health benefits', 'retirement plan', 'paid training opportunities'],
    sliderValues: {
      'work-pace': 85,
      'office-atmosphere': 70,
      'team-composition': 75,
      'feedback-style': 65,
      'management-style': 60,
      'remote-flex': 50,
      'work-life-balance': 65,
      'innovation-importance': 80,
      'autonomy-level': 60
    }
  },
  {
    name: 'Demo Co.',
    username: 'democo@example.com',
    contactName: 'William Davis',
    phone: '555-890-1234',
    companySize: 'medium',
    industry: 'Retail',
    description: 'Demo Co. is reimagining the retail experience through innovative e-commerce solutions and data-driven customer insights. We help businesses adapt to changing consumer behaviors.',
    locations: ['Los Angeles, CA', 'Chicago, IL'],
    workArrangements: ['hybrid', 'remote'],
    benefits: ['employee discount', 'flexible scheduling', 'paid parental leave', 'wellness resources'],
    sliderValues: {
      'work-pace': 75,
      'office-atmosphere': 90,
      'team-composition': 80,
      'feedback-style': 85,
      'management-style': 80,
      'remote-flex': 85,
      'work-life-balance': 80,
      'innovation-importance': 85,
      'autonomy-level': 75
    }
  },
  {
    name: 'Demo Inc.',
    username: 'demoinc@example.com',
    contactName: 'Emily Rodriguez',
    phone: '555-901-2345',
    companySize: 'large',
    industry: 'Telecommunications',
    description: 'Demo Inc. provides innovative telecommunications solutions for businesses and consumers. Our advanced network technologies enable seamless communication and connectivity.',
    locations: ['Dallas, TX', 'Atlanta, GA'],
    workArrangements: ['hybrid', 'flexible'],
    benefits: ['competitive salaries', 'health & wellness benefits', 'tuition reimbursement', 'retirement plan'],
    sliderValues: {
      'work-pace': 80,
      'office-atmosphere': 75,
      'team-composition': 70,
      'feedback-style': 75,
      'management-style': 70,
      'remote-flex': 70,
      'work-life-balance': 75,
      'innovation-importance': 85,
      'autonomy-level': 65
    }
  },
  {
    name: 'Fake Inc.',
    username: 'fakeinc@example.com',
    contactName: 'James Kim',
    phone: '555-012-3456',
    companySize: 'small',
    industry: 'Creative Services',
    description: 'Fake Inc. is a creative agency offering design, branding, and digital marketing services. We believe in the power of storytelling and visual communication to drive business growth.',
    locations: ['San Diego, CA', 'Portland, OR'],
    workArrangements: ['remote', 'flexible'],
    benefits: ['unlimited PTO', 'professional development budget', 'flexible scheduling', 'remote work stipend'],
    sliderValues: {
      'work-pace': 70,
      'office-atmosphere': 95,
      'team-composition': 90,
      'feedback-style': 90,
      'management-style': 85,
      'remote-flex': 95,
      'work-life-balance': 90,
      'innovation-importance': 95,
      'autonomy-level': 90
    }
  }
];

const DEFAULT_PASSWORD = 'Password123!';

async function seedCompanies() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    console.log('Starting company seed process...');
    
    // 1. Hash password once to reuse (all test accounts will have same password)
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    console.log('Password hashed successfully');

    // 2. Create user accounts and profiles for each company
    for (const company of COMPANIES) {
      console.log(`Creating company: ${company.name}`);
      
      // Check if user already exists
      const existingUsers = await db.select().from(users).where(eq(users.username, company.username));
      
      if (existingUsers.length > 0) {
        console.log(`User ${company.username} already exists, skipping...`);
        continue;
      }
      
      // Create user
      const [user] = await db.insert(users).values({
        username: company.username,
        password: hashedPassword,
        userType: 'employer',
        email: company.username,
        firstName: company.contactName,
        lastName: null,
        companyName: company.name,
        phone: company.phone,
      }).returning();
      
      console.log(`Created user ID: ${user.id} for ${company.name}`);
      
      // Create employer profile
      const [profile] = await db.insert(employerProfiles).values({
        userId: user.id,
        companyName: company.name,
        contactName: company.contactName,
        email: company.username,
        phone: company.phone,
        companySize: company.companySize,
        industry: company.industry,
        description: company.description,
        locations: company.locations,
        workArrangements: company.workArrangements,
        benefits: company.benefits,
        sliderValues: company.sliderValues,
      }).returning();
      
      console.log(`Created profile for ${company.name}`);
    }
    
    console.log('Seed completed successfully');
    await pool.end();
    
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();