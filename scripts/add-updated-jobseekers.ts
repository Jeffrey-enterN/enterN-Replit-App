import { db, pool } from '../server/db';
import { users, jobseekerProfiles } from '../shared/schema';
import { USER_TYPES, SLIDER_CATEGORIES } from '../client/src/lib/constants';
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

// Expanded university data with more schools and majors
const universityData: Record<string, UniversityData> = {
  'Bradley University': {
    name: 'Bradley University',
    domains: ['bradley.edu', 'mail.bradley.edu'],
    locations: ['Peoria, IL', 'Chicago, IL', 'Champaign, IL', 'Remote'],
    majors: [
      'Computer Science', 
      'Business Administration', 
      'Marketing', 
      'Mechanical Engineering',
      'Communication',
      'Graphic Design',
      'Psychology',
      'Nursing',
      'Accounting'
    ]
  },
  'Illinois State University': {
    name: 'Illinois State University',
    domains: ['ilstu.edu', 'mail.ilstu.edu'],
    locations: ['Normal, IL', 'Bloomington, IL', 'Chicago, IL', 'Springfield, IL', 'Remote'],
    majors: [
      'Computer Science', 
      'Nursing', 
      'Education', 
      'Marketing',
      'Accounting',
      'Information Systems',
      'Psychology',
      'Biology',
      'Political Science',
      'Communications'
    ]
  },
  'University of Illinois': {
    name: 'University of Illinois',
    domains: ['illinois.edu', 'uiuc.edu', 'uillinois.edu'],
    locations: ['Urbana, IL', 'Champaign, IL', 'Chicago, IL', 'Remote'],
    majors: [
      'Computer Engineering',
      'Computer Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Business Administration',
      'Physics',
      'Chemistry',
      'Data Science',
      'Finance',
      'Civil Engineering'
    ]
  },
  'Illinois Central College': {
    name: 'Illinois Central College',
    domains: ['icc.edu', 'mail.icc.edu'],
    locations: ['East Peoria, IL', 'Peoria, IL', 'Remote'],
    majors: [
      'Business Administration',
      'Nursing',
      'Computer Information Systems',
      'Criminal Justice',
      'Medical Assistant',
      'Accounting',
      'Engineering Technology',
      'Graphic Design',
      'Culinary Arts'
    ]
  },
  'Western Illinois University': {
    name: 'Western Illinois University',
    domains: ['wiu.edu', 'mail.wiu.edu'],
    locations: ['Macomb, IL', 'Quad Cities, IL', 'Remote'],
    majors: [
      'Computer Science',
      'Supply Chain Management',
      'Law Enforcement',
      'Education',
      'Agriculture',
      'Business',
      'Communication',
      'Engineering',
      'Health Sciences'
    ]
  }
};

// First names and last names for generating users
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Margaret', 'Anthony', 'Betty', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Edward', 'Deborah',
  'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
  'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna',
  'Stephen', 'Brenda', 'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Alexander', 'Debra', 'Frank', 'Rachel',
  'Patrick', 'Carolyn', 'Raymond', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria', 'Jerry', 'Heather',
  'Tyler', 'Diane', 'Aaron', 'Olivia', 'Jose', 'Julie', 'Adam', 'Joyce', 'Nathan', 'Victoria',
  'Henry', 'Kelly', 'Douglas', 'Christina', 'Zachary', 'Lauren', 'Peter', 'Joan', 'Kyle', 'Evelyn',
  'Walter', 'Judith', 'Ethan', 'Megan', 'Jeremy', 'Andrea', 'Harold', 'Cheryl', 'Keith', 'Hannah',
  'Christian', 'Jacqueline', 'Roger', 'Martha', 'Noah', 'Gloria', 'Gerald', 'Teresa', 'Carl', 'Ann',
  'Terry', 'Sara', 'Sean', 'Madison', 'Austin', 'Frances', 'Arthur', 'Kathryn', 'Lawrence', 'Janice',
  'Jesse', 'Jean', 'Dylan', 'Abigail', 'Bryan', 'Alice', 'Joe', 'Julia', 'Jordan', 'Judy'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King',
  'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
  'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
  'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez',
  'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross',
  'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington',
  'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'
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

// Generate slider values based on the updated slider categories from constants.ts
const generateUpdatedSliders = (): Record<string, number> => {
  const sliderValues: Record<string, number> = {};
  
  // Extract all slider IDs from SLIDER_CATEGORIES
  const allSliderIds: string[] = [];
  
  SLIDER_CATEGORIES.forEach(category => {
    category.sliders.forEach(slider => {
      allSliderIds.push(slider.id);
    });
  });
  
  // Generate random values for each slider
  allSliderIds.forEach(sliderId => {
    // Weighted distribution to make values more realistic and varied
    // Using a method that creates more values in the 30-70 range but still allows full spectrum
    let value;
    const distributionType = Math.random();
    
    if (distributionType < 0.6) {
      // 60% chance of a more central value (30-70 range)
      value = getRandomInt(30, 70);
    } else if (distributionType < 0.8) {
      // 20% chance of a lower value (10-30 range)
      value = getRandomInt(10, 30);
    } else {
      // 20% chance of a higher value (70-90 range)
      value = getRandomInt(70, 90);
    }
    
    // Add occasional extreme values (rare)
    if (Math.random() < 0.05) {
      value = getRandomInt(0, 10); // Very low
    } else if (Math.random() < 0.05) {
      value = getRandomInt(90, 100); // Very high
    }
    
    sliderValues[sliderId] = value;
  });
  
  // Add back-compatibility for older slider IDs used in the match-card component
  const legacySliderIds = [
    'schedule_vs_flexibility',
    'work_life_integration_vs_separation',
    'overtime_willingness',
    'travel_preference',
    'remote_vs_inoffice',
    'visual_vs_verbal',
    'critique_vs_praise',
    'formal_vs_casual',
    'frequent_vs_as_needed',
    'self_promotion_vs_modesty',
    'collaborative_vs_individual',
    'teamwork_vs_independence',
    'competition_vs_harmony',
    'consensus_vs_decisive',
    'group_input_vs_individual',
    'noise_vs_quiet',
    'speed_vs_precision',
    'direct_vs_diplomatic',
    'rule_adherence'
  ];
  
  legacySliderIds.forEach(sliderId => {
    if (!sliderValues[sliderId]) {
      sliderValues[sliderId] = getRandomInt(20, 80);
    }
  });
  
  return sliderValues;
};

// Function to hash password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Create the profile function
async function addUpdatedJobseekerProfiles() {
  try {
    console.log('Starting to create updated jobseeker profiles with the latest slider categories...');
    
    // Generate a temporary password for all test accounts
    const password = await hashPassword('password123');
    
    let profilesCreated = 0;
    const totalProfilesToCreate = 25; // Create 25 profiles as requested
    
    // Create profiles for each university
    for (const universityKey of Object.keys(universityData)) {
      const universityInfo = universityData[universityKey];
      const university = universityInfo.name;
      const domain = getRandomElement(universityInfo.domains);
      
      // Determine how many profiles to create for this university
      const profilesForUniversity = Math.ceil(totalProfilesToCreate / Object.keys(universityData).length);
      
      for (let i = 0; i < profilesForUniversity && profilesCreated < totalProfilesToCreate; i++) {
        // Generate user data
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const username = generateUsername(firstName, lastName);
        const email = generateEmail(firstName, lastName, domain);
        const graduationYear = getRandomInt(2024, 2027);
        const major = getRandomElement(universityInfo.majors);
        
        // Generate location preferences (1-3 locations)
        const preferredLocations: string[] = [];
        const primaryLocation = getRandomElement(universityInfo.locations);
        preferredLocations.push(primaryLocation);
        
        // Add additional locations for some profiles
        if (Math.random() > 0.3) {
          const otherLocations = universityInfo.locations.filter(loc => loc !== primaryLocation);
          if (otherLocations.length > 0) {
            const secondLocation = getRandomElement(otherLocations);
            preferredLocations.push(secondLocation);
          }
        }
        
        // Add remote option for some
        if (Math.random() > 0.7 && !preferredLocations.includes('Remote')) {
          preferredLocations.push('Remote');
        }

        // Generate profile slider values using the updated function
        const sliderValues = generateUpdatedSliders();
        
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
          workArrangements: Math.random() > 0.5 ? ['Hybrid', 'Remote'] : ['In-office', 'Hybrid'],
          sliderValues,
          profileComplete: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        profilesCreated++;
        console.log(`Created profile #${profilesCreated}: ${firstName} ${lastName} from ${university} (${major})`);
      }
    }
    
    console.log(`\nSuccessfully created ${profilesCreated} new jobseeker profiles with updated slider values.`);
    console.log('Login with any of these accounts using the password: password123');
    
  } catch (error) {
    console.error('Error creating profiles:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
addUpdatedJobseekerProfiles();