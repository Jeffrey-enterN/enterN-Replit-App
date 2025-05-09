import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { companies, users, jobPostings } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';

// Configure neon to use ws package for WebSockets
neonConfig.webSocketConstructor = ws;

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
    name: "Peoria Robotics",
    industries: ["Robotics", "Manufacturing"],
    size: "51-200",
    headquarters: "Peoria, IL",
    description: "Peoria Robotics designs and manufactures advanced robotic systems for industry.",
    jobs: [
      {
        title: "Robotics Engineering Intern",
        description: "Work on designing and testing robotic systems for industrial applications.",
        location: "Peoria, IL",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Manufacturing Technology Intern",
        description: "Help develop and implement manufacturing technologies and processes.",
        location: "Peoria, IL",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Manufacturing"
      },
      {
        title: "Automation Software Intern",
        description: "Develop software for robotic control systems and automated manufacturing.",
        location: "Peoria, IL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Software Development"
      }
    ]
  },
  {
    name: "Social Impact Partners",
    industries: ["Non-Profit", "Social Services"],
    size: "51-200",
    headquarters: "Washington, DC",
    description: "Social Impact Partners works on innovative solutions for social challenges.",
    jobs: [
      {
        title: "Non-Profit Management Intern",
        description: "Learn about non-profit operations and management in a growing organization.",
        location: "Washington, DC",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Management"
      },
      {
        title: "Social Impact Research Intern",
        description: "Research social issues and develop innovative solutions for communities.",
        location: "Washington, DC",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Research"
      }
    ]
  },
  {
    name: "AeroSpace Dynamics",
    industries: ["Aerospace", "Engineering"],
    size: "501-1000",
    headquarters: "Denver, CO",
    description: "AeroSpace Dynamics designs and manufactures aerospace components and systems.",
    jobs: [
      {
        title: "Aerospace Engineering Intern",
        description: "Work on designing and testing aerospace components and systems.",
        location: "Denver, CO",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Systems Integration Intern",
        description: "Help integrate various systems in aerospace applications.",
        location: "Denver, CO",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Systems Integration"
      }
    ]
  },
  {
    name: "QuantumLeap Computing",
    industries: ["Quantum Computing", "Technology"],
    size: "51-200",
    headquarters: "Boulder, CO",
    description: "QuantumLeap develops quantum computing solutions for complex problems.",
    jobs: [
      {
        title: "Quantum Computing Research Intern",
        description: "Work on cutting-edge quantum computing research and development.",
        location: "Boulder, CO",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Quantum Algorithm Development Intern",
        description: "Help develop algorithms for quantum computing applications.",
        location: "Boulder, CO",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Algorithm Development"
      }
    ]
  },
  {
    name: "Infinite Energy Solutions",
    industries: ["Energy", "Renewable Energy"],
    size: "201-500",
    headquarters: "Houston, TX",
    description: "Infinite Energy develops innovative solutions for renewable energy production and distribution.",
    jobs: [
      {
        title: "Renewable Energy Engineering Intern",
        description: "Work on engineering projects related to renewable energy systems.",
        location: "Houston, TX",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Energy Analysis Intern",
        description: "Help analyze energy data to improve renewable energy systems efficiency.",
        location: "Houston, TX",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Analysis"
      }
    ]
  },
  {
    name: "Urban Development Group",
    industries: ["Real Estate", "Urban Planning"],
    size: "51-200",
    headquarters: "Philadelphia, PA",
    description: "Urban Development Group focuses on sustainable urban development and community planning.",
    jobs: [
      {
        title: "Urban Planning Intern",
        description: "Work on urban development projects with a focus on community and sustainability.",
        location: "Philadelphia, PA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Planning"
      },
      {
        title: "Real Estate Analysis Intern",
        description: "Help analyze real estate data and market trends for development projects.",
        location: "Philadelphia, PA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Analysis"
      }
    ]
  },
  {
    name: "CyberSecure Networks",
    industries: ["Cybersecurity", "Information Technology"],
    size: "201-500",
    headquarters: "Arlington, VA",
    description: "CyberSecure provides advanced cybersecurity solutions for organizations.",
    jobs: [
      {
        title: "Cybersecurity Analyst Intern",
        description: "Work on identifying and mitigating cybersecurity threats.",
        location: "Arlington, VA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Security Analysis"
      },
      {
        title: "Security Software Development Intern",
        description: "Help develop software tools for cybersecurity applications.",
        location: "Arlington, VA",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Software Development"
      },
      {
        title: "Network Security Intern",
        description: "Work on securing network infrastructure and analyzing vulnerabilities.",
        location: "Arlington, VA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Network Security"
      }
    ]
  },
  {
    name: "Global Logistics Partners",
    industries: ["Logistics", "Supply Chain"],
    size: "501-1000",
    headquarters: "Atlanta, GA",
    description: "Global Logistics optimizes supply chain and logistics operations worldwide.",
    jobs: [
      {
        title: "Supply Chain Management Intern",
        description: "Learn about supply chain operations and optimization in a global company.",
        location: "Atlanta, GA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Supply Chain"
      },
      {
        title: "Logistics Analytics Intern",
        description: "Help analyze logistics data to improve efficiency and reduce costs.",
        location: "Atlanta, GA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Analytics"
      }
    ]
  },
  {
    name: "NexGen Automotive",
    industries: ["Automotive", "Manufacturing"],
    size: "1000+",
    headquarters: "Detroit, MI",
    description: "NexGen develops next-generation automotive technologies and systems.",
    jobs: [
      {
        title: "Automotive Engineering Intern",
        description: "Work on designing and testing automotive components and systems.",
        location: "Detroit, MI",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Automotive Electronics Intern",
        description: "Help develop electronic systems for modern vehicles.",
        location: "Detroit, MI",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Electronics"
      }
    ]
  },
  {
    name: "CloudScale Systems",
    industries: ["Cloud Computing", "Information Technology"],
    size: "201-500",
    headquarters: "San Francisco, CA",
    description: "CloudScale provides scalable cloud infrastructure and services for businesses.",
    jobs: [
      {
        title: "Cloud Infrastructure Intern",
        description: "Work on cloud infrastructure deployment and management.",
        location: "San Francisco, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Infrastructure"
      },
      {
        title: "DevOps Engineering Intern",
        description: "Help implement DevOps practices for cloud applications.",
        location: "San Francisco, CA",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "DevOps"
      }
    ]
  },
  {
    name: "Culinary Innovations",
    industries: ["Food & Beverage", "Hospitality"],
    size: "51-200",
    headquarters: "Nashville, TN",
    description: "Culinary Innovations creates unique food products and culinary experiences.",
    jobs: [
      {
        title: "Food Science Intern",
        description: "Work on developing and testing new food products.",
        location: "Nashville, TN",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Research & Development"
      },
      {
        title: "Culinary Marketing Intern",
        description: "Help market innovative food products and culinary experiences.",
        location: "Nashville, TN",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Marketing"
      }
    ]
  },
  {
    name: "Fashion Forward Designs",
    industries: ["Fashion", "Retail"],
    size: "201-500",
    headquarters: "New York, NY",
    description: "Fashion Forward creates innovative clothing designs and retail experiences.",
    jobs: [
      {
        title: "Fashion Design Intern",
        description: "Work with designers to create new clothing designs and collections.",
        location: "New York, NY",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Design"
      },
      {
        title: "Retail Marketing Intern",
        description: "Help develop marketing strategies for fashion retail.",
        location: "New York, NY",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Marketing"
      },
      {
        title: "Fashion Business Intern",
        description: "Learn about the business side of the fashion industry.",
        location: "New York, NY",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Business Operations"
      }
    ]
  },
  {
    name: "Sports Analytics Pro",
    industries: ["Sports", "Data Analytics"],
    size: "51-200",
    headquarters: "Boston, MA",
    description: "Sports Analytics Pro provides data analytics for sports teams and organizations.",
    jobs: [
      {
        title: "Sports Data Analyst Intern",
        description: "Help analyze sports performance data for teams and athletes.",
        location: "Boston, MA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Data Analysis"
      },
      {
        title: "Sports Technology Intern",
        description: "Work on developing technology solutions for sports analytics.",
        location: "Boston, MA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Technology"
      }
    ]
  },
  {
    name: "DigitalHealth Connect",
    industries: ["Healthcare", "Technology"],
    size: "201-500",
    headquarters: "Minneapolis, MN",
    description: "DigitalHealth connects patients with healthcare providers through innovative digital platforms.",
    jobs: [
      {
        title: "Health Informatics Intern",
        description: "Work on digital health information systems and platforms.",
        location: "Minneapolis, MN",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Informatics"
      },
      {
        title: "Digital Health Product Intern",
        description: "Help develop digital health products and services.",
        location: "Minneapolis, MN",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Product Development"
      }
    ]
  },
  {
    name: "Peoria Tourism Partners",
    industries: ["Tourism", "Hospitality"],
    size: "51-200",
    headquarters: "Peoria, IL",
    description: "Peoria Tourism promotes travel and tourism in the Peoria region.",
    jobs: [
      {
        title: "Tourism Marketing Intern",
        description: "Help develop marketing strategies to promote Peoria as a tourist destination.",
        location: "Peoria, IL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Marketing"
      },
      {
        title: "Event Planning Intern",
        description: "Assist in planning and executing tourism events in Peoria.",
        location: "Peoria, IL",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Events"
      }
    ]
  },
  {
    name: "GreenBuild Construction",
    industries: ["Construction", "Sustainability"],
    size: "201-500",
    headquarters: "Portland, OR",
    description: "GreenBuild specializes in sustainable construction and building practices.",
    jobs: [
      {
        title: "Sustainable Construction Intern",
        description: "Learn about sustainable building practices and green construction techniques.",
        location: "Portland, OR",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Construction"
      },
      {
        title: "Green Architecture Intern",
        description: "Work with architects on designing sustainable buildings.",
        location: "Portland, OR",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Architecture"
      }
    ]
  },
  {
    name: "Advanced Manufacturing Systems",
    industries: ["Manufacturing", "Engineering"],
    size: "501-1000",
    headquarters: "Pittsburgh, PA",
    description: "Advanced Manufacturing develops cutting-edge manufacturing systems and technologies.",
    jobs: [
      {
        title: "Manufacturing Engineering Intern",
        description: "Work on designing and improving manufacturing processes and systems.",
        location: "Pittsburgh, PA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Industrial Automation Intern",
        description: "Help develop automation solutions for manufacturing environments.",
        location: "Pittsburgh, PA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Automation"
      }
    ]
  },
  {
    name: "Public Policy Institute",
    industries: ["Government", "Public Policy"],
    size: "51-200",
    headquarters: "Washington, DC",
    description: "Public Policy Institute researches and develops solutions for public policy challenges.",
    jobs: [
      {
        title: "Policy Research Intern",
        description: "Conduct research on public policy issues and develop policy recommendations.",
        location: "Washington, DC",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Government Affairs Intern",
        description: "Learn about government relations and policy advocacy.",
        location: "Washington, DC",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Government Affairs"
      }
    ]
  },
  {
    name: "Digital Marketing Experts",
    industries: ["Marketing", "Advertising"],
    size: "51-200",
    headquarters: "Chicago, IL",
    description: "Digital Marketing Experts provides comprehensive digital marketing services for businesses.",
    jobs: [
      {
        title: "Digital Marketing Intern",
        description: "Work on digital marketing campaigns across various platforms.",
        location: "Chicago, IL",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Marketing"
      },
      {
        title: "Social Media Strategy Intern",
        description: "Help develop and implement social media strategies for clients.",
        location: "Chicago, IL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Social Media"
      },
      {
        title: "Content Creation Intern",
        description: "Create engaging content for digital marketing campaigns.",
        location: "Chicago, IL",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Content"
      }
    ]
  },
  {
    name: "Blockchain Ventures",
    industries: ["Blockchain", "Financial Technology"],
    size: "51-200",
    headquarters: "Miami, FL",
    description: "Blockchain Ventures develops blockchain solutions for various industries.",
    jobs: [
      {
        title: "Blockchain Developer Intern",
        description: "Work on developing blockchain applications and smart contracts.",
        location: "Miami, FL",
        workType: ["Remote"],
        employmentType: "Internship",
        department: "Development"
      },
      {
        title: "Blockchain Research Intern",
        description: "Research blockchain technologies and their applications in different industries.",
        location: "Miami, FL",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Research"
      }
    ]
  },
  {
    name: "Wildlife Conservation Alliance",
    industries: ["Environmental Conservation", "Non-Profit"],
    size: "51-200",
    headquarters: "Denver, CO",
    description: "Wildlife Conservation Alliance works to protect endangered species and their habitats.",
    jobs: [
      {
        title: "Conservation Research Intern",
        description: "Assist with research projects focused on wildlife conservation.",
        location: "Denver, CO",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Research"
      },
      {
        title: "Environmental Education Intern",
        description: "Help develop educational programs about wildlife conservation.",
        location: "Denver, CO",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Education"
      }
    ]
  },
  {
    name: "Space Exploration Technologies",
    industries: ["Aerospace", "Space Exploration"],
    size: "501-1000",
    headquarters: "Houston, TX",
    description: "Space Exploration develops technologies for space exploration and research.",
    jobs: [
      {
        title: "Aerospace Engineering Intern",
        description: "Work on designing components for space exploration vehicles and systems.",
        location: "Houston, TX",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      },
      {
        title: "Space Systems Intern",
        description: "Help develop systems for space exploration and research.",
        location: "Houston, TX",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Systems"
      }
    ]
  },
  {
    name: "Virtual Reality Innovations",
    industries: ["Virtual Reality", "Technology"],
    size: "51-200",
    headquarters: "San Jose, CA",
    description: "Virtual Reality Innovations creates VR experiences and technologies for various applications.",
    jobs: [
      {
        title: "VR Development Intern",
        description: "Work on developing virtual reality applications and experiences.",
        location: "San Jose, CA",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Development"
      },
      {
        title: "VR Design Intern",
        description: "Help design immersive virtual reality experiences and interfaces.",
        location: "San Jose, CA",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Design"
      }
    ]
  },
  {
    name: "Urban Transport Solutions",
    industries: ["Transportation", "Urban Planning"],
    size: "201-500",
    headquarters: "Dallas, TX",
    description: "Urban Transport develops innovative solutions for urban transportation challenges.",
    jobs: [
      {
        title: "Transportation Planning Intern",
        description: "Work on planning and analyzing urban transportation systems.",
        location: "Dallas, TX",
        workType: ["Hybrid"],
        employmentType: "Internship",
        department: "Planning"
      },
      {
        title: "Mobility Solutions Intern",
        description: "Help develop new mobility solutions for urban environments.",
        location: "Dallas, TX",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Solutions Development"
      }
    ]
  },
  {
    name: "Midwest Manufacturing Group",
    industries: ["Manufacturing", "Industrial"],
    size: "201-500",
    headquarters: "Milwaukee, WI",
    description: "Midwest Manufacturing produces quality industrial products for various sectors.",
    jobs: [
      {
        title: "Manufacturing Operations Intern",
        description: "Learn about manufacturing operations and process improvements.",
        location: "Milwaukee, WI",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Operations"
      },
      {
        title: "Industrial Engineering Intern",
        description: "Work on optimizing manufacturing processes and systems.",
        location: "Milwaukee, WI",
        workType: ["On-site"],
        employmentType: "Internship",
        department: "Engineering"
      }
    ]
  }
];

async function seedSampleCompanies() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    console.log('Starting sample companies seed process...');
    
    // Hash password once to reuse for all company admin accounts
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
        const existingUsers = await db.select().from(users).where(eq(users.username, username));
        let userId: number;
        
        if (existingUsers.length > 0) {
          userId = existingUsers[0].id;
          console.log(`  User already exists: ${username} (ID: ${userId})`);
        } else {
          // Create new user
          const [user] = await db.insert(users).values({
            username: username,
            password: hashedPassword,
            userType: 'employer',
            firstName: 'Admin',
            lastName: companyData.name,
            email: username
          }).returning();
          
          userId = user.id;
          console.log(`  Created user: ${username} (ID: ${userId})`);
        }
        
        // 2. Create or update company
        const [company] = await db.insert(companies).values({
          name: companyData.name,
          adminName: 'Admin',
          adminEmail: username,
          headquarters: companyData.headquarters,
          size: companyData.size,
          industries: companyData.industries,
          about: companyData.description,
          workArrangements: ['Remote', 'Hybrid', 'On-site'],
          isVerified: true
        }).returning();
        
        console.log(`  Created company: ${company.name} (ID: ${company.id})`);
        companiesCreated++;
        
        // 3. Link user to company
        await db.update(users)
          .set({ 
            companyId: company.id,
            companyRole: 'admin'
          })
          .where(eq(users.id, userId));
        
        console.log(`  Linked user ${userId} to company ${company.id} as admin`);
        
        // 4. Create job postings for this company
        for (const jobData of companyData.jobs) {
          const [job] = await db.insert(jobPostings).values({
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            workType: jobData.workType,
            employmentType: jobData.employmentType,
            department: jobData.department,
            companyId: company.id,
            status: 'active',
            createdById: userId
          }).returning();
          
          console.log(`  Created job: ${job.title} (ID: ${job.id})`);
          jobsCreated++;
        }
      } catch (error) {
        console.error(`Error creating company ${companyData.name}:`, error);
        // Continue with the next company
      }
    }
    
    console.log('Seed completed successfully');
    console.log(`Created ${companiesCreated} companies and ${jobsCreated} job postings`);
    
    await pool.end();
    
  } catch (error) {
    console.error('Error seeding sample companies:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedSampleCompanies().catch(console.error);