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
    id: 'organizational_values_mission',
    name: 'Organizational Values & Mission Alignment',
    description: 'Adjust the following sliders to indicate where in each statement you feel best reflects your preferences for the kind of organization you want to be a part of.',
    sliders: [
      {
        id: 'mission_clarity',
        name: 'Clear, Unyielding Mission',
        leftLabel: 'Strictly Defined Mission Statements',
        rightLabel: 'Adaptable, Evolving Mission Focus'
      },
      {
        id: 'traditional_values',
        name: 'Traditional Values',
        leftLabel: 'Emphasis on Legacy & Stability',
        rightLabel: 'Innovative, Risk-Tolerant Values'
      },
      {
        id: 'cultural_expectations',
        name: 'Uniform Cultural Expectations',
        leftLabel: 'Standardized Organizational Culture',
        rightLabel: 'Diverse, Personalized Cultural Expression'
      },
      {
        id: 'stability_vs_innovation',
        name: 'Long-Term Stability vs. Short-Term Innovation',
        leftLabel: 'Values Stability and Consistency',
        rightLabel: 'Values Continuous Innovation and Change'
      },
      {
        id: 'community_vs_market',
        name: 'Community Engagement vs. Market Leadership',
        leftLabel: 'Prioritizes Social Responsibility and Local Impact',
        rightLabel: 'Emphasizes Competitive, Market-Driven Success'
      }
    ]
  },

  {
    id: 'work_style_preferences',
    name: 'Work Style Preferences',
    description: 'Use these sliders to indicate the preferred style you wish to work in order to thrive and be at your most productive.',
    sliders: [
      {
        id: 'fixed_vs_flexible',
        name: 'Fixed Schedule vs. Flexible Hours',
        leftLabel: 'Prefers a Consistent, Fixed Work Schedule',
        rightLabel: 'Values Flexible, Adaptive Working Hours'
      },
      {
        id: 'documentation_vs_minimal',
        name: 'Detailed Documentation vs. Minimal Paperwork',
        leftLabel: 'Values Comprehensive Documentation and Processes',
        rightLabel: 'Prefers Minimal Administrative Overhead'
      },
      {
        id: 'predictable_vs_varied',
        name: 'Predictable Workflow vs. Varied Tasks',
        leftLabel: 'Thrives on Repetitive, Predictable Tasks',
        rightLabel: 'Enjoys a Variety of Task Types and Challenges'
      },
      {
        id: 'team_vs_individual',
        name: 'Team Orientation vs. Individual Focus',
        leftLabel: 'Collaborative, Group-Driven Work',
        rightLabel: 'Independent, Solo Work Preference'
      },
      {
        id: 'planned_vs_spontaneous',
        name: 'Planned vs. Spontaneous Workflow',
        leftLabel: 'Reliance on Detailed Planning',
        rightLabel: 'Adaptability to Spontaneous Tasks'
      }
    ]
  },
  {
    id: 'preferred_leadership_supervisor',
    name: 'Preferred Leadership & Supervisor Styles',
    description: 'Use these sliders to indicate the type of manager/supervisor you would feel most comfortable working with.',
    sliders: [
      {
        id: 'policy_vs_situation',
        name: 'Policy Rigor vs. Situational Adaptability',
        leftLabel: 'Strict Adherence to Policies',
        rightLabel: 'Adaptable to Situations'
      },
      {
        id: 'directive_vs_handsoff',
        name: 'Directive vs. Hands-Off Approach',
        leftLabel: 'Taskmaster & Transparent Guidance',
        rightLabel: 'Hands-Off & Ambiguous Support'
      },
      {
        id: 'competitive_vs_collaborative',
        name: 'Competitive vs. Collaborative Environment',
        leftLabel: 'Encourages Competition Among Team Members',
        rightLabel: 'Fosters a Collaborative Team Spirit'
      },
      {
        id: 'boundaries_vs_availability',
        name: 'Clear Boundaries vs. High Availability',
        leftLabel: 'Sets Firm Boundaries',
        rightLabel: 'Always Accessible for Support'
      },
      {
        id: 'formal_vs_casual_feedback',
        name: 'Formal Feedback Sessions vs. Casual Check-Ins',
        leftLabel: 'Expects Scheduled, Formalized Feedback',
        rightLabel: 'Values Informal, Spontaneous Feedback'
      },
      {
        id: 'clear_roles_vs_fluid',
        name: 'Clear Role Definitions vs. Fluid Responsibilities',
        leftLabel: 'Prefers Clearly Defined Roles and Responsibilities',
        rightLabel: 'Comfortable with Evolving Role Expectations'
      },
      {
        id: 'process_vs_outcome',
        name: 'Process Emphasis vs. Outcome Focus',
        leftLabel: 'Values Leaders Who Emphasize Process and Procedure',
        rightLabel: 'Favors Leaders Focused on Results and Outcomes'
      }
    ]
  },
  {
    id: 'preferred_work_environment',
    name: 'Preferred Work Environment',
    description: 'Use these sliders to indicate the physical work environment in which you\'ll thrive.',
    sliders: [
      {
        id: 'controlled_vs_dynamic',
        name: 'Controlled vs. Dynamic Settings',
        leftLabel: 'Quiet, Controlled Workspace',
        rightLabel: 'Dynamic, Open-Plan Environment'
      },
      {
        id: 'routine_vs_variety',
        name: 'Routine vs. Variety',
        leftLabel: 'Predictable, Routine-Based Environment',
        rightLabel: 'Ever-Changing, Fast-Paced Atmosphere'
      },
      {
        id: 'quiet_vs_collaborative',
        name: 'Quiet Individual Spaces vs. Open Collaborative Areas',
        leftLabel: 'Prefers Private, Quiet Workspaces',
        rightLabel: 'Thrives in Open, Collaborative Settings'
      },
      {
        id: 'consistent_vs_varied',
        name: 'Consistent Environment vs. Varied Work Settings',
        leftLabel: 'Values a Consistent, Unchanging Workspace',
        rightLabel: 'Enjoys Switching Between Different Work Settings (office, remote, co-working)'
      },
      {
        id: 'formal_vs_casual_atmosphere',
        name: 'Formal Atmosphere vs. Casual Culture',
        leftLabel: 'Prefers a Formal, Professional Office',
        rightLabel: 'Values a Relaxed, Casual Work Culture'
      },
      {
        id: 'traditional_vs_modern',
        name: 'Traditional Setup vs. Modern Tech-Driven Space',
        leftLabel: 'Favors a Conventional Office Layout',
        rightLabel: 'Embraces a Modern, Innovative Workspace with the Latest Tech'
      }
    ]
  },
  {
    id: 'collaboration_communication_style',
    name: 'Collaboration & Communication Style Preferences',
    description: 'Use these sliders to indicate how you best interact with peers, customers, and leadership.',
    sliders: [
      {
        id: 'direct_vs_nuanced',
        name: 'Direct vs. Nuanced Communication',
        leftLabel: 'Direct, Clear-Cut Communication',
        rightLabel: 'Nuanced, Contextual Dialogue'
      },
      {
        id: 'formal_vs_informal_meetings',
        name: 'Formal Meetings vs. Informal Chats',
        leftLabel: 'Structured, Scheduled Meetings',
        rightLabel: 'Casual, Ad-Hoc Discussions'
      },
      {
        id: 'written_vs_verbal_preference',
        name: 'Written vs. Verbal Communication',
        leftLabel: 'Preference for Written Communication',
        rightLabel: 'Preference for Face-to-Face or Verbal Exchanges'
      },
      {
        id: 'scheduled_vs_spontaneous',
        name: 'Scheduled Communication vs. Spontaneous Interaction',
        leftLabel: 'Prefers Pre-Planned Communication Sessions',
        rightLabel: 'Values Spontaneous, Impromptu Discussions'
      },
      {
        id: 'cross_functional_vs_department',
        name: 'Cross-Functional Collaboration vs. Department Focus',
        leftLabel: 'Enjoys Collaborating Across Different Teams',
        rightLabel: 'Prefers Working Within a Single Department'
      },
      {
        id: 'structured_vs_open_feedback',
        name: 'Structured Feedback Channels vs. Open-Door Policies',
        leftLabel: 'Prefers Organized, Scheduled Feedback Opportunities',
        rightLabel: 'Values an Open-Door Approach for Continuous, Informal Feedback'
      }
    ]
  },
  {
    id: 'growth_motivation_development',
    name: 'Growth, Intrinsic Motivation & Development Goals',
    description: 'Use these sliders to indicate how you prefer to learn, grow, and advance your professional knowledge.',
    sliders: [
      {
        id: 'structured_vs_self_directed',
        name: 'Structured Development vs. Self-Directed Growth',
        leftLabel: 'Clear, Formal Career Development Plans',
        rightLabel: 'Self-Directed, Organic Growth Opportunities'
      },
      {
        id: 'specific_vs_exploratory',
        name: 'Skill-Specific Training vs. Exploratory Learning',
        leftLabel: 'Focused, Specialized Training Programs',
        rightLabel: 'Broad, Exploratory Learning Experiences'
      },
      {
        id: 'longterm_vs_shortterm',
        name: 'Long-Term Advancement vs. Short-Term Achievements',
        leftLabel: 'Focus on Long-Term Career Progression',
        rightLabel: 'Emphasis on Short-Term, Project-Based Success'
      },
      {
        id: 'achievement_vs_learning',
        name: 'Achievement-Oriented vs. Learning-Oriented',
        leftLabel: 'Driven by Achieving Targets and Recognitions',
        rightLabel: 'Motivated by Continuous Learning and Personal Development'
      },
      {
        id: 'external_vs_self_reflection',
        name: 'External Benchmarking vs. Self-Reflection',
        leftLabel: 'Measures Success Against External Standards',
        rightLabel: 'Values Personal Benchmarks and Self-Reflection'
      },
      {
        id: 'quantitative_vs_qualitative',
        name: 'Quantitative Goals vs. Qualitative Impact',
        leftLabel: 'Focused on Measurable, Quantitative Targets',
        rightLabel: 'Driven by the Qualitative Impact and Personal Fulfillment of Work'
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