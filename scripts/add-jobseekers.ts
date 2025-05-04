import { db, pool } from '../server/db';
import { users, jobseekerProfiles } from '../shared/schema';
import { USER_TYPES } from '../client/src/lib/constants';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Common profile data
type UniversityData = {
  name: string;
  domains: string[];
  locations: string[];
  majors: string[];
};

const universityData: Record<string, UniversityData> = {
  'Bradley University': {
    name: 'Bradley University',
    domains: ['bradley.edu', 'mail.bradley.edu'],
    locations: ['Peoria, IL', 'Chicago, IL', 'Remote'],
    majors: [
      'Computer Science', 
      'Business Administration', 
      'Marketing', 
      'Mechanical Engineering',
      'Communication'
    ]
  },
  'Eureka College': {
    name: 'Eureka College',
    domains: ['eureka.edu', 'mail.eureka.edu'],
    locations: ['Eureka, IL', 'Peoria, IL', 'Remote'],
    majors: [
      'Business Administration', 
      'Psychology', 
      'Education', 
      'Criminal Justice',
      'History'
    ]
  },
  'Illinois State University': {
    name: 'Illinois State University',
    domains: ['ilstu.edu', 'mail.ilstu.edu'],
    locations: ['Normal, IL', 'Bloomington, IL', 'Chicago, IL', 'Remote'],
    majors: [
      'Computer Science', 
      'Nursing', 
      'Education', 
      'Marketing',
      'Accounting'
    ]
  },
  'Rutgers University': {
    name: 'Rutgers University',
    domains: ['rutgers.edu', 'scarletmail.rutgers.edu'],
    locations: ['New Brunswick, NJ', 'Newark, NJ', 'Camden, NJ', 'Remote'],
    majors: [
      'Computer Science', 
      'Business Administration', 
      'Engineering',
      'Psychology',
      'Biology'
    ]
  }
};

const studentNames = [
  { firstName: 'James', lastName: 'Wilson' },
  { firstName: 'Emma', lastName: 'Martinez' },
  { firstName: 'Michael', lastName: 'Taylor' },
  { firstName: 'Sophia', lastName: 'Anderson' },
  { firstName: 'William', lastName: 'Thomas' },
  { firstName: 'Olivia', lastName: 'Jackson' },
  { firstName: 'Benjamin', lastName: 'White' },
  { firstName: 'Ava', lastName: 'Harris' },
  { firstName: 'Ethan', lastName: 'Martin' },
  { firstName: 'Charlotte', lastName: 'Thompson' },
  { firstName: 'Daniel', lastName: 'Garcia' },
  { firstName: 'Mia', lastName: 'Martinez' },
  { firstName: 'Matthew', lastName: 'Robinson' },
  { firstName: 'Amelia', lastName: 'Clark' },
  { firstName: 'Alexander', lastName: 'Rodriguez' },
  { firstName: 'Harper', lastName: 'Lewis' },
  { firstName: 'David', lastName: 'Walker' },
  { firstName: 'Abigail', lastName: 'Allen' },
  { firstName: 'Joseph', lastName: 'Young' },
  { firstName: 'Emily', lastName: 'King' },
  { firstName: 'John', lastName: 'Wright' },
  { firstName: 'Elizabeth', lastName: 'Lopez' },
  { firstName: 'Samuel', lastName: 'Hill' },
  { firstName: 'Sofia', lastName: 'Scott' },
  { firstName: 'Christopher', lastName: 'Green' },
  { firstName: 'Ella', lastName: 'Adams' },
  { firstName: 'Andrew', lastName: 'Baker' },
  { firstName: 'Scarlett', lastName: 'Gonzalez' },
  { firstName: 'Jack', lastName: 'Nelson' },
  { firstName: 'Grace', lastName: 'Carter' }
];

// Generate random profile data
const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateUsername = (firstName: string, lastName: string): string => {
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}`;
};

const generateEmail = (firstName: string, lastName: string, domain: string): string => {
  const randomNum = Math.floor(Math.random() * 100);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
};

const generateSliders = (): Record<string, number> => {
  // These values should be based on the sliders in your application
  const sliderCategories = [
    'noise_vs_quiet', 'collaborative_vs_individual', 'creative_vs_analytical',
    'schedule_vs_flexibility', 'initiative_vs_direction', 'risk_vs_stability',
    'specialist_vs_generalist', 'social_vs_reserved', 'formal_vs_casual',
    'experimental_vs_proven', 'outcome_vs_process', 'speed_vs_precision',
    'critique_vs_praise', 'autonomous_vs_aligned', 'learning_vs_executing',
    'visual_vs_verbal', 'strategic_vs_tactical', 'adaptable_vs_focused',
    'competition_vs_harmony', 'innovation_vs_convention', 'reflection_vs_action',
    'work_life_integration_vs_separation', 'hierarchy_vs_flat', 'objective_vs_subjective',
    'hands_on_vs_theory', 'teamwork_vs_independence', 'self_promotion_vs_modesty',
    'variety_vs_routine', 'decisive_vs_deliberate', 'detail_vs_big_picture'
  ];

  const sliderValues: Record<string, number> = {};
  
  sliderCategories.forEach(slider => {
    // Generate values weighted slightly toward middle values
    // but with enough variability to be interesting (30-70 range more likely)
    const value = Math.floor(Math.random() * 100);
    sliderValues[slider] = value;
  });

  return sliderValues;
};

// Function to hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Create university distribution
const createUniversityDistribution = (totalProfiles: number) => {
  // Bradley: 8, Eureka: 8, ISU: 7, Rutgers: 2
  return {
    'Bradley University': Math.round(totalProfiles * 0.32),
    'Eureka College': Math.round(totalProfiles * 0.32),
    'Illinois State University': Math.round(totalProfiles * 0.28),
    'Rutgers University': Math.round(totalProfiles * 0.08),
  };
};

// Main function to add profiles
async function addJobseekerProfiles() {
  try {
    console.log('Starting to add jobseeker profiles...');
    
    const totalProfiles = 25;
    const distribution = createUniversityDistribution(totalProfiles);
    
    let profilesCreated = 0;
    
    for (const [university, count] of Object.entries(distribution)) {
      console.log(`Creating ${count} profiles for ${university}...`);
      const universityInfo = universityData[university];
      
      for (let i = 0; i < count; i++) {
        // Make sure we don't run out of names or exceed our desired count
        if (profilesCreated >= totalProfiles || profilesCreated >= studentNames.length) {
          break;
        }
        
        const nameData = studentNames[profilesCreated];
        const { firstName, lastName } = nameData;
        
        const username = generateUsername(firstName, lastName);
        const domain = getRandomElement(universityInfo.domains);
        const email = generateEmail(firstName, lastName, domain);
        const password = await hashPassword('password123'); // Standard password for test accounts
        const major = getRandomElement(universityInfo.majors);
        const graduationYear = getRandomInt(2024, 2026);
        const preferredLocations = [getRandomElement(universityInfo.locations)];
        
        // Add a second location preference for some profiles
        if (Math.random() > 0.5) {
          const secondLocation = getRandomElement(universityInfo.locations);
          if (secondLocation !== preferredLocations[0]) {
            preferredLocations.push(secondLocation);
          }
        }
        
        // Add remote option for some
        if (Math.random() > 0.7 && !preferredLocations.includes('Remote')) {
          preferredLocations.push('Remote');
        }

        // Generate profile slider values
        const sliderValues = generateSliders();
        
        // Insert new user
        console.log(`Creating user ${username} (${firstName} ${lastName})...`);
        const [newUser] = await db.insert(users).values({
          username,
          password,
          userType: USER_TYPES.JOBSEEKER,
          firstName,
          lastName,
          email,
          phone: `309${getRandomInt(1000000, 9999999)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        if (!newUser) {
          console.error(`Failed to create user ${username}`);
          continue;
        }
        
        // Insert jobseeker profile
        console.log(`Creating profile for ${firstName} ${lastName}...`);
        await db.insert(jobseekerProfiles).values({
          userId: newUser.id,
          school: university,
          degreeLevel: 'Bachelor\'s',
          major,
          graduationYear,
          gpa: (getRandomInt(25, 40) / 10).toFixed(1),
          preferredLocations,
          workArrangements: Math.random() > 0.5 ? ['Hybrid', 'Remote'] : ['Onsite', 'Hybrid'],
          sliderValues,
          profileComplete: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        profilesCreated++;
        console.log(`Created profile #${profilesCreated}: ${firstName} ${lastName} from ${university}`);
      }
    }
    
    console.log(`Successfully created ${profilesCreated} jobseeker profiles`);
  } catch (error) {
    console.error('Error creating jobseeker profiles:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addJobseekerProfiles();