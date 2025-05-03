// User Types
export const USER_TYPES = {
  JOBSEEKER: 'jobseeker',
  EMPLOYER: 'employer'
};

// Common Industries
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Banking',
  'Insurance',
  'Retail',
  'Manufacturing',
  'Education',
  'Government',
  'Non-profit',
  'Logistics',
  'Transportation',
  'Food & Beverage',
  'Agriculture',
  'Energy',
  'Pharmaceutical',
  'Biotechnology',
  'Telecommunications',
  'Media',
  'Entertainment',
  'Hospitality',
  'Construction',
  'Real Estate',
  'Consulting',
  'Legal',
  'Automotive',
  'Aerospace',
  'Defense',
  'Consumer Goods',
  'E-commerce'
];

// Functional Areas
export const FUNCTIONAL_AREAS = [
  'Software Development',
  'Design',
  'Product Management',
  'Project Management',
  'Data Science',
  'Data Analytics',
  'Marketing',
  'Sales',
  'Customer Support',
  'Customer Success',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Research',
  'Administration',
  'Executive',
  'Education',
  'Engineering',
  'Quality Assurance',
  'DevOps',
  'Security',
  'Content Creation',
  'Business Development',
  'Consulting'
];

// Work Arrangements
export const WORK_ARRANGEMENTS = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'in-office', label: 'In-office' },
  { id: 'flexible', label: 'Flexible' }
];

// Company Sizes
export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1,000 employees',
  '1,001-5,000 employees',
  '5,001-10,000 employees',
  '10,001+ employees'
];

// Job Types
export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Apprenticeship'
];

// Common Benefits
export const COMPANY_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  'Life Insurance',
  'Disability Insurance',
  '401(k) / Retirement Plan',
  'Paid Time Off',
  'Remote Work Options',
  'Flexible Hours',
  'Parental Leave',
  'Professional Development',
  'Tuition Reimbursement',
  'Gym Membership',
  'Wellness Programs',
  'Company Events',
  'Stock Options',
  'Profit Sharing',
  'Relocation Assistance',
  'Company Phone',
  'Free Meals/Snacks',
  'Childcare Assistance',
  'Pet-Friendly Office',
  'Mental Health Support',
  'Student Loan Assistance'
];

// Compensation Levels
export const COMPENSATION_LEVELS = [
  'Entry-level',
  'Mid-level',
  'Senior-level',
  'Executive',
  'Competitive',
  'Industry-standard',
  'Above market rate'
];

// Development Program Durations
export const PROGRAM_DURATIONS = [
  '3 months',
  '6 months',
  '9 months',
  '1 year',
  '18 months',
  '2 years',
  '3+ years'
];

// Brand Colors
export const BRAND_COLORS = {
  primary: '#0097B1',
  secondary: '#FF66C4',
  accent: '#5CE1E6',
  black: '#000000',
  darkGray: '#767979',
  gray: '#B6B6B6',
  white: '#FFFFFF',
  highlight: '#C8FD04'
};

// Form Validation Messages
export const FORM_VALIDATION = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidUrl: 'Please enter a valid URL',
  invalidZip: 'Please enter a valid ZIP code',
  passwordLength: 'Password must be at least 8 characters long',
  passwordMismatch: 'Passwords do not match',
  invalidYear: 'Please enter a valid year'
};

// Profile Creation Steps - Employer Company
export const COMPANY_PROFILE_STEPS = [
  {
    id: 1,
    title: 'Company Basics',
    shortTitle: 'Basics',
    description: 'Let\'s start with the essential information about your company'
  },
  {
    id: 2,
    title: 'About Your Company',
    shortTitle: 'About',
    description: 'Tell us more about what your company does and its mission'
  },
  {
    id: 3,
    title: 'Work Environment & Programs',
    shortTitle: 'Environment',
    description: 'Share details about your company\'s work environment, benefits, and development programs'
  }
];

// Profile Creation Steps - Jobseeker
export const JOBSEEKER_PROFILE_STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Let\'s start with your basic information'
  },
  {
    id: 2,
    title: 'Education & Experience',
    description: 'Tell us about your background and preferences'
  },
  {
    id: 3,
    title: 'Work Values',
    description: 'Help us understand what matters most to you in a workplace'
  }
];

// Sample culture terms for keyword extraction
export const CULTURE_KEYWORDS = [
  'collaborative',
  'innovative',
  'fast-paced',
  'creative',
  'inclusive',
  'diverse',
  'team-oriented',
  'flexible',
  'work-life balance',
  'remote-first',
  'entrepreneurial',
  'mission-driven',
  'data-driven',
  'customer-focused',
  'agile',
  'casual',
  'formal',
  'hands-on',
  'transparent',
  'learning culture',
  'feedback-oriented',
  'family-friendly',
  'competitive',
  'supportive',
  'autonomous'
];

// Locations
export const LOCATIONS = [
  'Remote',
  'New York, NY',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Boston, MA',
  'Seattle, WA',
  'Austin, TX',
  'Denver, CO',
  'Atlanta, GA',
  'Dallas, TX',
  'Washington, DC',
  'Miami, FL',
  'Philadelphia, PA',
  'Phoenix, AZ',
  'Portland, OR',
  'Minneapolis, MN',
  'Nashville, TN',
  'Charlotte, NC',
  'San Diego, CA',
  'Toronto, Canada',
  'London, UK',
  'Berlin, Germany',
  'Paris, France',
  'Tokyo, Japan',
  'Singapore',
  'Sydney, Australia',
  'Bangalore, India',
  'Dublin, Ireland',
  'Amsterdam, Netherlands'
];

// Degree Levels
export const DEGREE_LEVELS = [
  'High School',
  'Associate\'s Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'MBA',
  'Ph.D.',
  'Professional Degree (MD, JD, etc.)',
  'Trade School / Certificate',
  'Other'
];

// Functional Roles
export const FUNCTIONAL_ROLES = [
  { id: 'software_engineer', label: 'Software Engineer' },
  { id: 'frontend_developer', label: 'Frontend Developer' },
  { id: 'backend_developer', label: 'Backend Developer' },
  { id: 'full_stack_developer', label: 'Full Stack Developer' },
  { id: 'mobile_developer', label: 'Mobile Developer' },
  { id: 'devops_engineer', label: 'DevOps Engineer' },
  { id: 'qa_engineer', label: 'QA Engineer' },
  { id: 'data_scientist', label: 'Data Scientist' },
  { id: 'data_analyst', label: 'Data Analyst' },
  { id: 'data_engineer', label: 'Data Engineer' },
  { id: 'machine_learning_engineer', label: 'Machine Learning Engineer' },
  { id: 'ui_ux_designer', label: 'UI/UX Designer' },
  { id: 'product_manager', label: 'Product Manager' },
  { id: 'project_manager', label: 'Project Manager' },
  { id: 'program_manager', label: 'Program Manager' },
  { id: 'business_analyst', label: 'Business Analyst' },
  { id: 'marketing_specialist', label: 'Marketing Specialist' },
  { id: 'sales_representative', label: 'Sales Representative' },
  { id: 'customer_success_manager', label: 'Customer Success Manager' },
  { id: 'human_resources', label: 'Human Resources' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'finance_analyst', label: 'Finance Analyst' },
  { id: 'executive', label: 'Executive' },
  { id: 'administrative_support', label: 'Administrative Support' },
  { id: 'operations_manager', label: 'Operations Manager' },
  { id: 'content_creator', label: 'Content Creator' },
  { id: 'social_media_manager', label: 'Social Media Manager' }
];

// Slider Categories for Values Assessment
export const SLIDER_CATEGORIES = [
  {
    id: 'work_environment',
    name: 'Work Environment',
    description: 'How you prefer to work day-to-day',
    sliders: [
      {
        id: 'structured_vs_flexible',
        name: 'Structured vs. Flexible',
        leftLabel: 'Prefer clear structure',
        rightLabel: 'Prefer flexibility'
      },
      {
        id: 'collaborative_vs_independent',
        name: 'Collaborative vs. Independent',
        leftLabel: 'Prefer collaboration',
        rightLabel: 'Prefer independence'
      },
      {
        id: 'fast_paced_vs_methodical',
        name: 'Fast-paced vs. Methodical',
        leftLabel: 'Prefer fast pace',
        rightLabel: 'Prefer methodical pace'
      },
      {
        id: 'risk_taking_vs_cautious',
        name: 'Risk-taking vs. Cautious',
        leftLabel: 'Comfortable with risk',
        rightLabel: 'Prefer caution'
      },
      {
        id: 'innovation_vs_tradition',
        name: 'Innovation vs. Tradition',
        leftLabel: 'Value innovation',
        rightLabel: 'Value tradition'
      }
    ]
  },
  {
    id: 'work_style',
    name: 'Work Style',
    description: 'Your preferred working style and environment',
    sliders: [
      {
        id: 'casual_vs_formal',
        name: 'Casual vs. Formal',
        leftLabel: 'Prefer casual environment',
        rightLabel: 'Prefer formal environment'
      },
      {
        id: 'open_office_vs_private',
        name: 'Open Office vs. Private',
        leftLabel: 'Prefer open workspace',
        rightLabel: 'Prefer private workspace'
      },
      {
        id: 'remote_vs_inoffice',
        name: 'Remote vs. In-office',
        leftLabel: 'Prefer remote work',
        rightLabel: 'Prefer in-office work'
      },
      {
        id: 'multitasking_vs_focused',
        name: 'Multitasking vs. Focused',
        leftLabel: 'Prefer multitasking',
        rightLabel: 'Prefer focused work'
      },
      {
        id: 'noise_vs_quiet',
        name: 'Noisy vs. Quiet',
        leftLabel: 'Work well with background noise',
        rightLabel: 'Prefer quiet environment'
      }
    ]
  },
  {
    id: 'leadership_style',
    name: 'Leadership Style',
    description: 'Your preferences for leadership and management',
    sliders: [
      {
        id: 'directive_vs_empowering',
        name: 'Directive vs. Empowering',
        leftLabel: 'Prefer clear direction',
        rightLabel: 'Prefer empowerment'
      },
      {
        id: 'hands_on_vs_delegating',
        name: 'Hands-on vs. Delegating',
        leftLabel: 'Prefer hands-on leadership',
        rightLabel: 'Prefer delegation'
      },
      {
        id: 'detail_oriented_vs_big_picture',
        name: 'Detail-oriented vs. Big Picture',
        leftLabel: 'Focus on details',
        rightLabel: 'Focus on big picture'
      },
      {
        id: 'regular_feedback_vs_autonomy',
        name: 'Regular Feedback vs. Autonomy',
        leftLabel: 'Value regular feedback',
        rightLabel: 'Value autonomy'
      },
      {
        id: 'challenging_vs_supportive',
        name: 'Challenging vs. Supportive',
        leftLabel: 'Prefer to be challenged',
        rightLabel: 'Prefer to be supported'
      }
    ]
  },
  {
    id: 'management_approach',
    name: 'Management Approach',
    description: 'How you prefer to be managed',
    sliders: [
      {
        id: 'formal_vs_informal_leadership',
        name: 'Formal vs. Informal Leadership',
        leftLabel: 'Prefer formal leadership',
        rightLabel: 'Prefer informal leadership'
      },
      {
        id: 'consensus_vs_decisive',
        name: 'Consensus vs. Decisive',
        leftLabel: 'Value consensus',
        rightLabel: 'Value decisive leadership'
      },
      {
        id: 'hierarchical_vs_flat',
        name: 'Hierarchical vs. Flat',
        leftLabel: 'Prefer clear hierarchy',
        rightLabel: 'Prefer flat structure'
      },
      {
        id: 'mentorship_vs_peer_learning',
        name: 'Mentorship vs. Peer Learning',
        leftLabel: 'Value mentorship',
        rightLabel: 'Value peer learning'
      },
      {
        id: 'performance_vs_potential',
        name: 'Performance vs. Potential',
        leftLabel: 'Value current performance',
        rightLabel: 'Value long-term potential'
      }
    ]
  },
  {
    id: 'company_values',
    name: 'Company Values',
    description: 'What matters to you in an organization',
    sliders: [
      {
        id: 'profit_vs_purpose',
        name: 'Profit vs. Purpose',
        leftLabel: 'Value profitability',
        rightLabel: 'Value purpose/mission'
      },
      {
        id: 'growth_vs_stability',
        name: 'Growth vs. Stability',
        leftLabel: 'Value rapid growth',
        rightLabel: 'Value stability'
      },
      {
        id: 'global_vs_local',
        name: 'Global vs. Local',
        leftLabel: 'Value global reach',
        rightLabel: 'Value local focus'
      },
      {
        id: 'competitive_vs_collaborative_culture',
        name: 'Competitive vs. Collaborative Culture',
        leftLabel: 'Value competitive culture',
        rightLabel: 'Value collaborative culture'
      },
      {
        id: 'customer_vs_employee_first',
        name: 'Customer vs. Employee First',
        leftLabel: 'Customer-first mentality',
        rightLabel: 'Employee-first mentality'
      }
    ]
  },
  {
    id: 'organizational_culture',
    name: 'Organizational Culture',
    description: 'Cultural aspects of an organization that matter to you',
    sliders: [
      {
        id: 'data_driven_vs_intuition',
        name: 'Data-driven vs. Intuition',
        leftLabel: 'Value data-driven decisions',
        rightLabel: 'Value intuition and experience'
      },
      {
        id: 'transparency_vs_privacy',
        name: 'Transparency vs. Privacy',
        leftLabel: 'Value transparency',
        rightLabel: 'Value privacy'
      },
      {
        id: 'traditional_vs_progressive',
        name: 'Traditional vs. Progressive',
        leftLabel: 'Value traditional approach',
        rightLabel: 'Value progressive approach'
      },
      {
        id: 'financial_vs_social_impact',
        name: 'Financial vs. Social Impact',
        leftLabel: 'Prioritize financial metrics',
        rightLabel: 'Prioritize social impact'
      },
      {
        id: 'company_loyalty_vs_industry_mobility',
        name: 'Company Loyalty vs. Industry Mobility',
        leftLabel: 'Value company loyalty',
        rightLabel: 'Value industry mobility'
      }
    ]
  },
  {
    id: 'communication_style',
    name: 'Communication Style',
    description: 'How you prefer to communicate in the workplace',
    sliders: [
      {
        id: 'direct_vs_diplomatic',
        name: 'Direct vs. Diplomatic',
        leftLabel: 'Prefer direct communication',
        rightLabel: 'Prefer diplomatic communication'
      },
      {
        id: 'written_vs_verbal',
        name: 'Written vs. Verbal',
        leftLabel: 'Prefer written communication',
        rightLabel: 'Prefer verbal communication'
      },
      {
        id: 'frequent_vs_as_needed',
        name: 'Frequent vs. As-Needed',
        leftLabel: 'Prefer frequent updates',
        rightLabel: 'Prefer as-needed updates'
      },
      {
        id: 'formal_vs_casual_comm',
        name: 'Formal vs. Casual Communication',
        leftLabel: 'Prefer formal communication',
        rightLabel: 'Prefer casual communication'
      },
      {
        id: 'detailed_vs_concise',
        name: 'Detailed vs. Concise',
        leftLabel: 'Prefer detailed information',
        rightLabel: 'Prefer concise information'
      }
    ]
  },
  {
    id: 'work_life_balance',
    name: 'Work-Life Balance',
    description: 'Your preferences for balancing work and personal life',
    sliders: [
      {
        id: 'work_life_separation_vs_integration',
        name: 'Separation vs. Integration',
        leftLabel: 'Prefer clear boundaries',
        rightLabel: 'Prefer work-life integration'
      },
      {
        id: 'flexible_hours_vs_fixed',
        name: 'Flexible Hours vs. Fixed Schedule',
        leftLabel: 'Prefer flexible hours',
        rightLabel: 'Prefer fixed schedule'
      },
      {
        id: 'overtime_willingness',
        name: 'Overtime Willingness',
        leftLabel: 'Avoid overtime when possible',
        rightLabel: 'Willing to work extra hours'
      },
      {
        id: 'travel_preference',
        name: 'Travel Preference',
        leftLabel: 'Prefer minimal travel',
        rightLabel: 'Open to frequent travel'
      },
      {
        id: 'professional_development_time',
        name: 'Professional Development',
        leftLabel: 'Learning during work hours',
        rightLabel: 'Learning on personal time'
      }
    ]
  },
  {
    id: 'decision_making',
    name: 'Decision Making',
    description: 'How you approach decisions in the workplace',
    sliders: [
      {
        id: 'analytical_vs_intuitive',
        name: 'Analytical vs. Intuitive',
        leftLabel: 'Prefer analytical approach',
        rightLabel: 'Trust intuition'
      },
      {
        id: 'quick_vs_thorough',
        name: 'Quick vs. Thorough',
        leftLabel: 'Decide quickly',
        rightLabel: 'Thorough consideration'
      },
      {
        id: 'group_input_vs_individual',
        name: 'Group Input vs. Individual',
        leftLabel: 'Gather group input',
        rightLabel: 'Decide independently'
      },
      {
        id: 'risk_averse_vs_risk_seeking',
        name: 'Risk-Averse vs. Risk-Seeking',
        leftLabel: 'Avoid risks when possible',
        rightLabel: 'Willing to take calculated risks'
      },
      {
        id: 'pragmatic_vs_idealistic',
        name: 'Pragmatic vs. Idealistic',
        leftLabel: 'Pragmatic solutions',
        rightLabel: 'Idealistic solutions'
      }
    ]
  }
];