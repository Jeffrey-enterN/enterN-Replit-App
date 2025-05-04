import { db } from '../db';
import { users, companies, employerProfiles } from '../../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createEmployerWithCompany(employerData: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyData: {
    name: string;
    website?: string;
    headquarters: string;
    yearFounded?: number;
    size: string;
    industries: string[];
    about: string;
    culture?: string;
    mission?: string;
    values?: string[];
    additionalOffices?: string[];
    workArrangements?: string[];
  }
}) {
  console.log(`Creating employer account for ${employerData.companyData.name}...`);
  
  // First check if this company or user already exists
  const existingCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.name, employerData.companyData.name));
    
  if (existingCompanies.length > 0) {
    console.log(`Company ${employerData.companyData.name} already exists. Skipping.`);
    return existingCompanies[0];
  }
  
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.username, employerData.username));
    
  if (existingUsers.length > 0) {
    console.log(`User with username ${employerData.username} already exists. Skipping.`);
    return;
  }
  
  // Create the company first
  const [company] = await db
    .insert(companies)
    .values({
      name: employerData.companyData.name,
      website: employerData.companyData.website || null,
      headquarters: employerData.companyData.headquarters,
      yearFounded: employerData.companyData.yearFounded || null,
      size: employerData.companyData.size,
      industries: employerData.companyData.industries || [],
      about: employerData.companyData.about,
      culture: employerData.companyData.culture || null,
      mission: employerData.companyData.mission || null,
      values: employerData.companyData.values ? employerData.companyData.values.join(', ') : null,
      additionalOffices: employerData.companyData.additionalOffices || [],
      workArrangements: employerData.companyData.workArrangements || [],
      profileCompletion: 90, // Almost complete
      isVerified: true, // These are pre-verified
    })
    .returning();
    
  console.log(`Created company record for ${company.name} with ID ${company.id}`);
  
  // Now create the user as a company admin
  const [user] = await db
    .insert(users)
    .values({
      username: employerData.username,
      password: await hashPassword(employerData.password),
      userType: 'employer',
      firstName: employerData.firstName,
      lastName: employerData.lastName,
      email: employerData.email,
      companyName: employerData.companyData.name,
      companyId: company.id,
      companyRole: 'admin'
    })
    .returning();
    
  console.log(`Created employer user ${user.username} with ID ${user.id}`);
  
  // Finally create an employer profile to ensure it appears in the match feed
  const [profile] = await db
    .insert(employerProfiles)
    .values({
      userId: user.id,
      companyName: employerData.companyData.name,
      companyWebsite: employerData.companyData.website,
      headquarters: employerData.companyData.headquarters,
      yearFounded: employerData.companyData.yearFounded,
      companySize: employerData.companyData.size,
      companyIndustry: Array.isArray(employerData.companyData.industries) 
        ? employerData.companyData.industries[0] 
        : 'Technology',
      aboutCompany: employerData.companyData.about,
      additionalOffices: employerData.companyData.additionalOffices || [],
      companyMission: employerData.companyData.mission || '',
      companyValues: Array.isArray(employerData.companyData.values) 
        ? employerData.companyData.values.join(', ')
        : '',
      benefits: []
    })
    .returning();
    
  console.log(`Created employer profile for ${user.username}`);
  
  return { company, user, profile };
}

async function main() {
  console.log('Adding Peoria employer profiles...');
  
  const peoriaEmployers = [
    {
      username: 'cat_recruiter',
      email: 'careers@caterpillar.com',
      password: 'CatPassword123!',
      firstName: 'Caterpillar',
      lastName: 'Recruiter',
      companyData: {
        name: 'Caterpillar Inc.',
        website: 'https://www.caterpillar.com',
        headquarters: 'Deerfield, IL',
        yearFounded: 1925,
        size: '10,000+',
        industries: ['Manufacturing', 'Construction', 'Mining', 'Energy', 'Transportation'],
        about: 'Caterpillar is the world\'s leading manufacturer of construction and mining equipment, diesel and natural gas engines, industrial gas turbines, and diesel-electric locomotives.',
        mission: 'To enable economic growth through infrastructure and energy development, and to provide solutions that support communities and protect the planet.',
        workArrangements: ['Onsite', 'Hybrid'],
        additionalOffices: ['Peoria, IL', 'East Peoria, IL', 'Mossville, IL']
      }
    },
    {
      username: 'osf_recruiter',
      email: 'careers@osfhealthcare.org',
      password: 'OsfPassword123!',
      firstName: 'OSF',
      lastName: 'Recruiter',
      companyData: {
        name: 'OSF HealthCare',
        website: 'https://www.osfhealthcare.org',
        headquarters: 'Peoria, IL',
        yearFounded: 1877,
        size: '10,000+',
        industries: ['Healthcare', 'Medical Services'],
        about: 'OSF HealthCare is an integrated health system owned and operated by The Sisters of the Third Order of St. Francis, headquartered in Peoria, Illinois.',
        mission: 'To serve persons with the greatest care and love in a community that celebrates the Gift of Life.',
        workArrangements: ['Onsite', 'Hybrid'],
        additionalOffices: ['Bloomington, IL', 'Rockford, IL', 'Urbana, IL']
      }
    },
    {
      username: 'pearl_recruiter',
      email: 'careers@pearltechnology.com',
      password: 'PearlPassword123!',
      firstName: 'Pearl',
      lastName: 'Recruiter',
      companyData: {
        name: 'Pearl Technology',
        website: 'https://www.pearltechnology.com',
        headquarters: 'Peoria, IL',
        yearFounded: 1984,
        size: '51-200',
        industries: ['Technology', 'IT Services', 'Cybersecurity'],
        about: 'Pearl Technology is a business-to-business IT firm specializing in cybersecurity, networking, data center, and audio/video solutions.',
        values: ['Integrity', 'Excellence', 'Innovation', 'Customer Focus'],
        workArrangements: ['Hybrid', 'Remote'],
        additionalOffices: []
      }
    },
    {
      username: 'alcast_recruiter',
      email: 'careers@alcast.com',
      password: 'AlcastPassword123!',
      firstName: 'Alcast',
      lastName: 'Recruiter',
      companyData: {
        name: 'ALCAST Company',
        website: 'https://www.alcast.com',
        headquarters: 'Peoria, IL',
        yearFounded: 1946,
        size: '201-500',
        industries: ['Manufacturing', 'Die Casting', 'Aerospace'],
        about: 'ALCAST Company specializes in aluminum die casting and precision machining, serving aerospace, defense, medical, and other industries requiring high-precision components.',
        workArrangements: ['Onsite'],
        additionalOffices: []
      }
    },
    {
      username: 'skbcyber_recruiter',
      email: 'careers@skbcyber.com',
      password: 'SkbPassword123!',
      firstName: 'SKB',
      lastName: 'Recruiter',
      companyData: {
        name: 'SKB Cyber',
        website: 'https://www.skbcyber.com',
        headquarters: 'Peoria, IL',
        yearFounded: 2015,
        size: '11-50',
        industries: ['Cybersecurity', 'Information Technology'],
        about: 'SKB Cyber provides cybersecurity solutions for businesses, focusing on managed security services, compliance, and penetration testing.',
        workArrangements: ['Hybrid', 'Remote'],
        additionalOffices: []
      }
    },
    {
      username: 'gpedc_recruiter',
      email: 'careers@greaterpeoriaedc.org',
      password: 'GpedcPassword123!',
      firstName: 'GPEDC',
      lastName: 'Recruiter',
      companyData: {
        name: 'Greater Peoria Economic Development Council',
        website: 'https://www.greaterpeoriaedc.org',
        headquarters: 'Peoria, IL',
        yearFounded: 1982,
        size: '11-50',
        industries: ['Economic Development', 'Non-Profit', 'Government Relations'],
        about: 'The Greater Peoria Economic Development Council drives economic growth in the five-county Greater Peoria region through targeted business and talent development and attraction.',
        mission: 'To promote economic development in the Greater Peoria region through business attraction, retention, and workforce development.',
        workArrangements: ['Hybrid'],
        additionalOffices: []
      }
    },
    {
      username: 'ats_recruiter',
      email: 'careers@advancedtech.com',
      password: 'AtsPassword123!',
      firstName: 'ATS',
      lastName: 'Recruiter',
      companyData: {
        name: 'Advanced Technology Services',
        website: 'https://www.advancedtech.com',
        headquarters: 'Peoria, IL',
        yearFounded: 1985,
        size: '1,001-5,000',
        industries: ['Industrial Services', 'Manufacturing', 'Information Technology'],
        about: 'Advanced Technology Services (ATS) improves productivity and profitability for many of the world\'s most respected manufacturers through maintenance services, parts repair, and IT solutions.',
        workArrangements: ['Onsite', 'Hybrid'],
        additionalOffices: ['Greenville, SC', 'Mexico City, Mexico', 'Monterrey, Mexico']
      }
    },
    {
      username: 'pekin_recruiter',
      email: 'careers@pekininsurance.com',
      password: 'PekinPassword123!',
      firstName: 'Pekin',
      lastName: 'Recruiter',
      companyData: {
        name: 'Pekin Insurance',
        website: 'https://www.pekininsurance.com',
        headquarters: 'Pekin, IL',
        yearFounded: 1921,
        size: '501-1,000',
        industries: ['Insurance', 'Financial Services'],
        about: 'Pekin Insurance provides auto, home, business, life, and health insurance products across multiple states in the Midwest, working through independent agents.',
        mission: 'To provide peace of mind for our policyholders by fulfilling our promises to them.',
        workArrangements: ['Hybrid', 'Onsite'],
        additionalOffices: []
      }
    }
  ];

  for (const employer of peoriaEmployers) {
    try {
      await createEmployerWithCompany(employer);
    } catch (error) {
      console.error(`Error creating employer for ${employer.companyData.name}:`, error);
    }
  }

  console.log('Finished adding Peoria employer profiles.');
}

// Run the main function immediately
main()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

export { createEmployerWithCompany };