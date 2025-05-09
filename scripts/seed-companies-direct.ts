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
  {
    name: "FutureHealth Medical",
    industries: ["Healthcare", "MedTech"],
    size: "201-500",
    headquarters: "Boston, MA",
    description: "FutureHealth develops innovative medical technologies to improve patient care.",
    jobs: [
      {
        title: "Data Science Intern",
        description: "Help analyze medical data to improve patient outcomes and healthcare delivery.",
        location: "Boston, MA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Data Science"
      },
      {
        title: "Healthcare Administration Intern",
        description: "Learn about healthcare operations and administration in a growing medical technology company.",
        location: "Boston, MA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Administration"
      },
      {
        title: "Biomedical Engineering Intern",
        description: "Work on cutting-edge medical device development and testing.",
        location: "Cambridge, MA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      }
    ]
  },
  {
    name: "EcoSustain Enterprises",
    industries: ["Environmental Services", "Sustainability"],
    size: "51-200",
    headquarters: "Portland, OR",
    description: "EcoSustain develops sustainable solutions for businesses and communities.",
    jobs: [
      {
        title: "Environmental Science Intern",
        description: "Work on sustainability projects and help develop eco-friendly business solutions.",
        location: "Portland, OR",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Green Marketing Intern",
        description: "Help promote sustainable products and services to environmentally conscious consumers.",
        location: "Portland, OR",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Marketing"
      }
    ]
  },
  {
    name: "FinTech Innovations",
    industries: ["Finance", "Technology"],
    size: "201-500",
    headquarters: "New York, NY",
    description: "FinTech Innovations creates cutting-edge financial technology solutions.",
    jobs: [
      {
        title: "Financial Analysis Intern",
        description: "Work with our finance team to analyze market trends and develop financial models.",
        location: "New York, NY",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Finance"
      },
      {
        title: "FinTech Developer Intern",
        description: "Help build the next generation of financial technology applications.",
        location: "New York, NY",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Engineering"
      }
    ]
  },
  {
    name: "CreativeMinds Media",
    industries: ["Media", "Entertainment"],
    size: "51-200",
    headquarters: "Los Angeles, CA",
    description: "CreativeMinds produces innovative content for digital and traditional media platforms.",
    jobs: [
      {
        title: "Content Creation Intern",
        description: "Help create engaging content for various media platforms and audiences.",
        location: "Los Angeles, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Content"
      },
      {
        title: "Digital Marketing Intern",
        description: "Work on social media campaigns and digital marketing strategies for media clients.",
        location: "Los Angeles, CA",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Marketing"
      }
    ]
  },
  {
    name: "AgriTech Solutions",
    industries: ["Agriculture", "Technology"],
    size: "51-200",
    headquarters: "Des Moines, IA",
    description: "AgriTech develops innovative technology solutions for modern agriculture.",
    jobs: [
      {
        title: "AgriTech Research Intern",
        description: "Work on cutting-edge agricultural technology projects and research.",
        location: "Des Moines, IA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Agricultural Data Analyst Intern",
        description: "Help analyze farm data to improve crop yields and efficiency.",
        location: "Des Moines, IA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Data Analysis"
      }
    ]
  },
  {
    name: "GlobalLearn Education",
    industries: ["Education", "EdTech"],
    size: "201-500",
    headquarters: "Austin, TX",
    description: "GlobalLearn creates educational technology solutions for schools and learners worldwide.",
    jobs: [
      {
        title: "Educational Content Developer Intern",
        description: "Help create engaging educational content for diverse learning platforms.",
        location: "Austin, TX",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Content Development"
      },
      {
        title: "EdTech Product Design Intern",
        description: "Work on designing user-friendly educational technology products.",
        location: "Austin, TX",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Product Design"
      }
    ]
  },
  {
    name: "SmartRetail Solutions",
    industries: ["Retail", "Technology"],
    size: "201-500",
    headquarters: "Seattle, WA",
    description: "SmartRetail develops innovative technology solutions for the modern retail industry.",
    jobs: [
      {
        title: "Retail Analytics Intern",
        description: "Help analyze retail data to improve customer experience and business operations.",
        location: "Seattle, WA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Analytics"
      },
      {
        title: "E-commerce Development Intern",
        description: "Work on developing and improving e-commerce platforms and experiences.",
        location: "Seattle, WA",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Development"
      }
    ]
  },
  {
    name: "NovaBio Sciences",
    industries: ["Biotechnology", "Pharmaceuticals"],
    size: "201-500",
    headquarters: "San Diego, CA",
    description: "NovaBio develops breakthrough biotechnology solutions for healthcare challenges.",
    jobs: [
      {
        title: "Biotech Research Intern",
        description: "Assist with laboratory research in biotechnology and pharmaceutical development.",
        location: "San Diego, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Clinical Data Analysis Intern",
        description: "Help analyze clinical trial data for developing new treatments.",
        location: "San Diego, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Clinical Analysis"
      }
    ]
  },
  {
    name: "GlobalTech Consulting",
    industries: ["Consulting", "Technology"],
    size: "1000+",
    headquarters: "Chicago, IL",
    description: "GlobalTech provides technology consulting services to clients worldwide.",
    jobs: [
      {
        title: "Technology Consulting Intern",
        description: "Work with consulting teams to solve complex technology challenges for clients.",
        location: "Chicago, IL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Consulting"
      },
      {
        title: "Business Analysis Intern",
        description: "Help analyze business requirements and develop technology solutions for clients.",
        location: "Chicago, IL",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Business Analysis"
      }
    ]
  },
  {
    name: "CleanEnergy Innovations",
    industries: ["Energy", "Sustainability"],
    size: "51-200",
    headquarters: "Denver, CO",
    description: "CleanEnergy develops renewable energy solutions for a sustainable future.",
    jobs: [
      {
        title: "Renewable Energy Engineering Intern",
        description: "Work on developing innovative renewable energy technologies.",
        location: "Denver, CO",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Energy Sustainability Analyst Intern",
        description: "Help analyze sustainability metrics and develop business cases for clean energy adoption.",
        location: "Denver, CO",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Business Analysis"
      }
    ]
  },
  {
    name: "SpaceX Technologies",
    industries: ["Aerospace", "Engineering"],
    size: "1000+",
    headquarters: "Hawthorne, CA",
    description: "SpaceX designs, manufactures and launches advanced rockets and spacecraft.",
    jobs: [
      {
        title: "Aerospace Engineering Intern",
        description: "Assist with designing and testing spacecraft components and systems.",
        location: "Hawthorne, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Mission Operations Intern",
        description: "Help support spacecraft mission planning and operations.",
        location: "Hawthorne, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Operations"
      }
    ]
  },
  {
    name: "SportsTech Solutions",
    industries: ["Sports", "Technology"],
    size: "51-200",
    headquarters: "Dallas, TX",
    description: "SportsTech develops technology solutions for sports teams, athletes, and fans.",
    jobs: [
      {
        title: "Sports Analytics Intern",
        description: "Analyze sports data to provide insights for teams and athletes.",
        location: "Dallas, TX",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Analytics"
      },
      {
        title: "Sports Tech Developer Intern",
        description: "Help build technology solutions for enhancing athletic performance and fan experiences.",
        location: "Dallas, TX",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Development"
      }
    ]
  },
  {
    name: "FoodTech Innovations",
    industries: ["Food & Beverage", "Technology"],
    size: "201-500",
    headquarters: "Minneapolis, MN",
    description: "FoodTech creates innovative solutions for the food industry, focusing on sustainability and efficiency.",
    jobs: [
      {
        title: "Food Science Intern",
        description: "Work on developing new food products and improving existing ones.",
        location: "Minneapolis, MN",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research & Development"
      },
      {
        title: "Food Supply Chain Analyst Intern",
        description: "Help analyze and optimize food supply chains for efficiency and sustainability.",
        location: "Minneapolis, MN",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Supply Chain"
      }
    ]
  },
  {
    name: "HealthTech Connect",
    industries: ["Healthcare", "Technology"],
    size: "201-500",
    headquarters: "Nashville, TN",
    description: "HealthTech Connect develops innovative digital health solutions that improve patient care and provider efficiency.",
    jobs: [
      {
        title: "Health Informatics Intern",
        description: "Work on healthcare data systems and analytics to improve patient outcomes.",
        location: "Nashville, TN",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Informatics"
      },
      {
        title: "Digital Health Product Intern",
        description: "Help develop and improve digital health products and services.",
        location: "Nashville, TN",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Product Development"
      }
    ]
  },
  {
    name: "CyberDefend Security",
    industries: ["Cybersecurity", "Technology"],
    size: "201-500",
    headquarters: "Washington, DC",
    description: "CyberDefend provides advanced cybersecurity solutions for businesses and organizations.",
    jobs: [
      {
        title: "Cybersecurity Analyst Intern",
        description: "Help identify and mitigate security threats and vulnerabilities.",
        location: "Washington, DC",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Security Operations"
      },
      {
        title: "Security Software Developer Intern",
        description: "Assist in developing security software solutions and tools.",
        location: "Washington, DC",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Development"
      }
    ]
  },
  {
    name: "UrbanCity Planning",
    industries: ["Urban Planning", "Architecture"],
    size: "51-200",
    headquarters: "Philadelphia, PA",
    description: "UrbanCity creates innovative urban planning solutions for sustainable cities.",
    jobs: [
      {
        title: "Urban Planning Intern",
        description: "Work on urban planning projects focused on sustainability and community development.",
        location: "Philadelphia, PA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Planning"
      },
      {
        title: "Urban Design Intern",
        description: "Help design urban spaces that enhance community life and environmental sustainability.",
        location: "Philadelphia, PA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Design"
      }
    ]
  },
  {
    name: "ElectroVision Systems",
    industries: ["Electronics", "Manufacturing"],
    size: "501-1000",
    headquarters: "San Jose, CA",
    description: "ElectroVision develops advanced electronic systems and components for various industries.",
    jobs: [
      {
        title: "Electronics Engineering Intern",
        description: "Work on designing and testing electronic components and systems.",
        location: "San Jose, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Manufacturing Process Intern",
        description: "Help optimize electronic manufacturing processes and quality control.",
        location: "San Jose, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Manufacturing"
      }
    ]
  },
  {
    name: "OceanTech Research",
    industries: ["Marine Science", "Environmental"],
    size: "51-200",
    headquarters: "Miami, FL",
    description: "OceanTech develops marine technologies for ocean conservation and research.",
    jobs: [
      {
        title: "Marine Science Intern",
        description: "Assist in marine research projects and data collection.",
        location: "Miami, FL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Ocean Conservation Analyst Intern",
        description: "Help analyze data and develop strategies for ocean conservation.",
        location: "Miami, FL",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Conservation"
      }
    ]
  },
  {
    name: "GreenBuild Construction",
    industries: ["Construction", "Sustainability"],
    size: "201-500",
    headquarters: "Portland, OR",
    description: "GreenBuild specializes in sustainable construction and building technologies.",
    jobs: [
      {
        title: "Sustainable Construction Intern",
        description: "Learn about green building practices and sustainable construction management.",
        location: "Portland, OR",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Construction"
      },
      {
        title: "Green Building Design Intern",
        description: "Assist in designing sustainable buildings and energy-efficient systems.",
        location: "Portland, OR",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Design"
      }
    ]
  },
  {
    name: "AeroMech Industries",
    industries: ["Aerospace", "Manufacturing"],
    size: "501-1000",
    headquarters: "Seattle, WA",
    description: "AeroMech designs and manufactures components for commercial and defense aerospace applications.",
    jobs: [
      {
        title: "Mechanical Engineering Intern",
        description: "Work on designing and testing mechanical components for aircraft systems.",
        location: "Seattle, WA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Aerospace Quality Assurance Intern",
        description: "Help ensure quality standards are met in aerospace manufacturing processes.",
        location: "Everett, WA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Quality Assurance"
      }
    ]
  },
  {
    name: "BioGen Pharmaceuticals",
    industries: ["Pharmaceuticals", "Biotechnology"],
    size: "1000+",
    headquarters: "Cambridge, MA",
    description: "BioGen develops innovative pharmaceutical solutions addressing critical health challenges.",
    jobs: [
      {
        title: "Pharmaceutical Research Intern",
        description: "Work on pharmaceutical research projects and drug development processes.",
        location: "Cambridge, MA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Clinical Trials Coordinator Intern",
        description: "Help coordinate and monitor pharmaceutical clinical trials.",
        location: "Boston, MA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Clinical Operations"
      }
    ]
  },
  {
    name: "Quantum Computing Labs",
    industries: ["Technology", "Computing"],
    size: "51-200",
    headquarters: "Berkeley, CA",
    description: "Quantum Computing Labs develops cutting-edge quantum computing technologies and applications.",
    jobs: [
      {
        title: "Quantum Computing Research Intern",
        description: "Work on quantum computing algorithms and research projects.",
        location: "Berkeley, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Quantum Software Development Intern",
        description: "Help develop software interfaces for quantum computing systems.",
        location: "Berkeley, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Software Development"
      }
    ]
  },
  {
    name: "Digital Media Collective",
    industries: ["Media", "Digital Marketing"],
    size: "51-200",
    headquarters: "Atlanta, GA",
    description: "Digital Media Collective creates innovative digital media content and marketing solutions.",
    jobs: [
      {
        title: "Digital Content Creation Intern",
        description: "Create engaging digital content for various platforms and audiences.",
        location: "Atlanta, GA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Content Creation"
      },
      {
        title: "Digital Marketing Strategy Intern",
        description: "Help develop and implement digital marketing strategies for clients.",
        location: "Atlanta, GA",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Marketing"
      }
    ]
  },
  {
    name: "VirtualReality Innovations",
    industries: ["Virtual Reality", "Technology"],
    size: "51-200",
    headquarters: "San Francisco, CA",
    description: "VirtualReality Innovations develops cutting-edge virtual reality applications and technologies.",
    jobs: [
      {
        title: "VR Development Intern",
        description: "Work on developing virtual reality applications and experiences.",
        location: "San Francisco, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Development"
      },
      {
        title: "VR User Experience Intern",
        description: "Help design and test user interfaces for virtual reality applications.",
        location: "San Francisco, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "User Experience"
      }
    ]
  }
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
            'INSERT INTO job_postings (id, title, description, location, work_type, employment_type, department, company_id, status, employer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
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