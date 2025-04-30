export const USER_TYPES = {
  JOBSEEKER: 'jobseeker',
  EMPLOYER: 'employer'
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const WORK_ARRANGEMENTS = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'onsite', label: 'Onsite' },
  { id: 'no-preference', label: 'No Preference' }
];

export const FUNCTIONAL_ROLES = [
  // Business Operations
  { id: 'administration', label: 'Administration' },
  { id: 'accounting-finance', label: 'Accounting & Finance' },
  { id: 'operations', label: 'Operations' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'supply-chain-logistics', label: 'Supply Chain & Logistics' },
  { id: 'procurement-vendor-management', label: 'Procurement & Vendor Management' },
  { id: 'facilities', label: 'Facilities' },
  
  // Technology & Product
  { id: 'engineering', label: 'Engineering' },
  { id: 'it', label: 'IT' },
  { id: 'design', label: 'Design' },
  { id: 'ui-ux', label: 'UI/UX' },
  { id: 'research-development', label: 'Research & Development' },
  { id: 'data-analytics-bi', label: 'Data Analytics & Business Intelligence' },
  { id: 'quality-assurance', label: 'Quality Assurance & Compliance' },
  { id: 'manufacturing-production', label: 'Manufacturing / Production' },
  
  // Customer-Facing
  { id: 'marketing', label: 'Marketing' },
  { id: 'sales-business-development', label: 'Sales & Business Development' },
  { id: 'customer-success', label: 'Customer Success / Client Services' },
  { id: 'pr-communications', label: 'Public Relations & Communications' },
  
  // Strategy & Leadership
  { id: 'corporate-strategy', label: 'Corporate Strategy' },
  { id: 'legal-regulatory', label: 'Legal & Regulatory Affairs' }
];

export const LOCATIONS = [
  // Major tech hubs
  'San Francisco, CA',
  'San Jose, CA',
  'Oakland, CA',
  'New York, NY',
  'Boston, MA',
  'Seattle, WA',
  'Austin, TX',
  'Denver, CO',
  'Chicago, IL',
  'Los Angeles, CA',
  
  // Other major cities
  'Atlanta, GA',
  'Dallas, TX',
  'Houston, TX',
  'Miami, FL',
  'Washington, DC',
  'Philadelphia, PA',
  'Phoenix, AZ',
  'San Diego, CA',
  'Portland, OR',
  'Minneapolis, MN',
  'Detroit, MI',
  'Raleigh, NC',
  'Charlotte, NC',
  'Nashville, TN',
  'Salt Lake City, UT',
  'Pittsburgh, PA',
  'Las Vegas, NV',
  'Columbus, OH',
  'Indianapolis, IN',
  'Kansas City, MO',
  
  // Special options
  'Remote - US Based',
  'Remote - Global'
];

export const INDUSTRIES = [
  // Technology & Media
  'Software & Technology',
  'Information Technology',
  'Consumer Internet',
  'Computer Hardware',
  'Media & Entertainment',
  'Telecommunications',
  'Gaming & Interactive Media',
  
  // Financial & Business Services
  'Banking & Financial Services',
  'Insurance',
  'Investment Management',
  'Accounting & Tax',
  'Management Consulting',
  'Legal Services',
  'Real Estate',
  
  // Health & Life Sciences
  'Healthcare Services',
  'Pharmaceuticals',
  'Biotechnology',
  'Medical Devices',
  'Health Technology',
  
  // Manufacturing & Industrial
  'Manufacturing',
  'Automotive',
  'Aerospace & Defense',
  'Construction & Engineering',
  'Electronics Manufacturing',
  'Chemical Manufacturing',
  
  // Consumer
  'Retail & E-commerce',
  'Consumer Goods',
  'Food & Beverage',
  'Hospitality & Travel',
  'Luxury Goods & Services',
  
  // Energy & Infrastructure
  'Energy & Utilities',
  'Oil & Gas',
  'Renewable Energy',
  'Mining & Metals',
  'Transportation & Logistics',
  
  // Education & Government
  'Education',
  'Government & Public Sector',
  'Non-profit & NGO',
  
  // Other
  'Agriculture & Agribusiness',
  'Environmental Services',
  'Other'
];

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1,000',
  '1,001-5,000',
  '5,001-10,000',
  '10,001+'
];

export const DEGREE_LEVELS = [
  'High School Diploma / GED',
  'Trade School / Certification',
  'Some College',
  '2-Year Degree',
  '4-Year Degree',
  'Master\'s Degree',
  'Doctorate'
];

export const COMPANY_BENEFITS = [
  { id: 'health-insurance', label: 'Health Insurance' },
  { id: 'dental-vision', label: 'Dental & Vision' },
  { id: '401k', label: '401(k)' },
  { id: 'remote-work', label: 'Remote Work' },
  { id: 'flexible-pto', label: 'Flexible PTO' },
  { id: 'parental-leave', label: 'Parental Leave' },
  { id: 'professional-development', label: 'Professional Development' },
  { id: 'equity', label: 'Equity' }
];

// Slider categories from the provided document
export const SLIDER_CATEGORIES = [
  {
    id: 'organizational-values',
    title: 'Organizational Values & Mission',
    sliders: [
      { id: 'mission-focus', left: 'Strictly Defined Mission Statements', right: 'Adaptable, Evolving Mission Focus' },
      { id: 'traditional-values', left: 'Emphasis on Legacy & Stability', right: 'Innovative, Risk-Tolerant Values' },
      { id: 'value-communication', left: 'Explicit, Written Value Statements', right: 'Emergent, Informal Value Expression' },
      { id: 'cultural-expectations', left: 'Standardized Organizational Culture', right: 'Diverse, Personalized Cultural Expression' },
      { id: 'goals-stability', left: 'Consistent, Long-Term Goals', right: 'Fluid, Changing Strategic Directions' },
      { id: 'innovation-stability', left: 'Values Stability and Consistency', right: 'Values Continuous Innovation and Change' },
      { id: 'decision-making', left: 'Prefers Top-Down Direction', right: 'Values Decentralized, Team Empowerment' },
      { id: 'tradition-experimentation', left: 'Emphasizes Time-Honored Practices', right: 'Embraces New Ideas and Experimentation' },
      { id: 'compliance-agility', left: 'Focuses on Adhering to Established Standards', right: 'Prioritizes Agile Adaptation over Rigidity' },
      { id: 'community-market', left: 'Prioritizes Social Responsibility and Local Impact', right: 'Emphasizes Competitive, Market-Driven Success' }
    ]
  },
  {
    id: 'working-style',
    title: 'Work Style Preferences',
    sliders: [
      { id: 'schedule', left: 'Prefers a Consistent, Fixed Work Schedule', right: 'Values Flexible, Adaptive Working Hours' },
      { id: 'documentation', left: 'Values Comprehensive Documentation and Processes', right: 'Prefers Minimal Administrative Overhead' },
      { id: 'workflow', left: 'Thrives on Repetitive, Predictable Tasks', right: 'Enjoys a Variety of Task Types and Challenges' },
      { id: 'communication', left: 'Prefers Regular Team Check-Ins', right: 'Values Minimal Interruptions for Deep Work' },
      { id: 'execution', left: 'Favors a Step-by-Step, Methodical Approach', right: 'Prefers Quick Experimentation and Iterative Processes' },
      { id: 'routine', left: 'Highly Structured Daily Routine', right: 'Flexible, Self-Paced Work Environment' },
      { id: 'guidance', left: 'Preference for Step-by-Step Instructions', right: 'Desire for Independent Decision-Making' },
      { id: 'teamorientation', left: 'Collaborative, Group-Driven Work', right: 'Independent, Solo Work Preference' },
      { id: 'plannedflow', left: 'Reliance on Detailed Planning', right: 'Adaptability to Spontaneous Tasks' },
      { id: 'processes', left: 'Following Established Processes', right: 'Tailoring Methods to the Situation' }
    ]
  },
  {
    id: 'leadership-style',
    title: 'Preferred Leadership & Supervisor Styles',
    sliders: [
      { id: 'policy-rigor', left: 'Strict Adherence to Policies', right: 'Adaptable to Situations' },
      { id: 'mentorship', left: 'Emphasis on Formal Training & Mentorship', right: 'Preference for Independent Learning' },
      { id: 'leadership-approach', left: 'Taskmaster & Transparent Guidance', right: 'Hands-Off & Ambiguous Support' },
      { id: 'recognition', left: 'Prefers Public Acknowledgment', right: 'Favors Private Recognition' },
      { id: 'team-environment', left: 'Encourages Competition Among Team Members', right: 'Fosters a Collaborative Team Spirit' },
      { id: 'boundaries', left: 'Sets Firm Boundaries', right: 'Always Accessible for Support' },
      { id: 'coaching', left: 'Prefers Leaders Who Coach Actively', right: 'Values Leaders Who Grant Independent Decision-Making' },
      { id: 'feedback', left: 'Expects Scheduled, Formalized Feedback', right: 'Values Informal, Spontaneous Feedback' },
      { id: 'role-definition', left: 'Prefers Clearly Defined Roles and Responsibilities', right: 'Comfortable with Evolving Role Expectations' },
      { id: 'process-outcome', left: 'Values Leaders Who Emphasize Process and Procedure', right: 'Favors Leaders Focused on Results and Outcomes' },
      { id: 'risk-leadership', left: 'Prefers Leaders Who Avoid Risk', right: 'Values Leaders Who Embrace Calculated Risks' }
    ]
  },
  {
    id: 'work-environment',
    title: 'Preferred Work Environment',
    sliders: [
      { id: 'setting', left: 'Quiet, Controlled Workspace', right: 'Dynamic, Open-Plan Environment' },
      { id: 'structure', left: 'Traditional, Hierarchical Office Setting', right: 'Casual, Flat Organizational Structure' },
      { id: 'variety', left: 'Predictable, Routine-Based Environment', right: 'Ever-Changing, Fast-Paced Atmosphere' },
      { id: 'stability', left: 'Stable, Consistent Work Conditions', right: 'Variety and Spontaneity in Tasks' },
      { id: 'interactions', left: 'Minimal Social Interactions', right: 'Lively, Collaborative Workspaces' },
      { id: 'workspace', left: 'Prefers Private, Quiet Workspaces', right: 'Thrives in Open, Collaborative Settings' },
      { id: 'environment-change', left: 'Values a Consistent, Unchanging Workspace', right: 'Enjoys Switching Between Different Work Settings (office, remote, co-working)' },
      { id: 'atmosphere', left: 'Prefers a Formal, Professional Office', right: 'Values a Relaxed, Casual Work Culture' },
      { id: 'tech-setup', left: 'Favors a Conventional Office Layout', right: 'Embraces a Modern, Innovative Workspace with the Latest Tech' },
      { id: 'scheduling', left: 'Prefers Regular, Predictable Work Patterns', right: 'Excels in Environments Driven by Projects or Events' }
    ]
  },
  {
    id: 'collaboration-style',
    title: 'Collaboration & Communication Style Preferences',
    sliders: [
      { id: 'direct-communication', left: 'Direct, Clear-Cut Communication', right: 'Nuanced, Contextual Dialogue' },
      { id: 'meeting-style', left: 'Structured, Scheduled Meetings', right: 'Casual, Ad-Hoc Discussions' },
      { id: 'work-independence', left: 'Regular, Frequent Updates', right: 'Minimal Interruptions and Independence' },
      { id: 'communication-medium', left: 'Preference for Written Communication', right: 'Preference for Face-to-Face or Verbal Exchanges' },
      { id: 'collaboration-preference', left: 'Open, Group Collaboration', right: 'Selective, One-on-One Interactions' },
      { id: 'communication-scheduling', left: 'Prefers Pre-Planned Communication Sessions', right: 'Values Spontaneous, Impromptu Discussions' },
      { id: 'formality', left: 'Values Formal, Documented Communication', right: 'Prefers Informal, Real-Time Messaging' },
      { id: 'cross-functional', left: 'Enjoys Collaborating Across Different Teams', right: 'Prefers Working Within a Single Department' },
      { id: 'consensus', left: 'Values Group Consensus and Shared Input', right: 'Favors Directives from Leadership in Communication' },
      { id: 'feedback-channel', left: 'Prefers Organized, Scheduled Feedback Opportunities', right: 'Values an Open-Door Approach for Continuous, Informal Feedback' }
    ]
  },
  {
    id: 'growth-motivation',
    title: 'Growth, Motivation, & Development',
    sliders: [
      { id: 'development-path', left: 'Clear, Formal Career Development Plans', right: 'Self-Directed, Organic Growth Opportunities' },
      { id: 'motivation-source', left: 'Motivated by External Recognition and Incentives', right: 'Driven by Internal Fulfillment and Passion' },
      { id: 'training-style', left: 'Focused, Specialized Training Programs', right: 'Broad, Exploratory Learning Experiences' },
      { id: 'achievement-timeline', left: 'Focus on Long-Term Career Progression', right: 'Emphasis on Short-Term, Project-Based Success' },
      { id: 'success-metrics', left: 'Measured by Formal Performance Metrics', right: 'Success Defined by Personal Growth and Engagement' },
      { id: 'growth-path', left: 'Values a Clear Hierarchical Career Path', right: 'Prefers Growth Based on Skills and Competence' }
    ]
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving & Decision-Making',
    sliders: [
      { id: 'problem-approach', left: 'Analytical, Data-Driven Approach', right: 'Intuitive, Experience-Based Solutions' },
      { id: 'decision-speed', left: 'Thoughtful, Deliberate Decisions', right: 'Quick, Adaptive Decision-Making' },
      { id: 'input-preference', left: 'Values Diverse Input & Opinions', right: 'Relies on Personal Expertise & Judgment' },
      { id: 'risk-tolerance', left: 'Cautious, Risk-Averse Approach', right: 'Comfortable with Calculated Risk-Taking' }
    ]
  },
  {
    id: 'adaptability',
    title: 'Adaptability & Resilience',
    sliders: [
      { id: 'change-response', left: 'Prefers Stability & Predictability', right: 'Embraces Change & Uncertainty' },
      { id: 'setback-handling', left: 'Process-Oriented When Facing Setbacks', right: 'Results-Focused During Challenges' },
      { id: 'pressure-response', left: 'Maintains Calm, Methodical Approach Under Pressure', right: 'Becomes Energized, Dynamic When Deadlines Loom' }
    ]
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence & Interpersonal Effectiveness',
    sliders: [
      { id: 'conflict-management', left: 'Addresses Conflicts Directly & Immediately', right: 'Takes Time to Reflect Before Addressing Issues' },
      { id: 'feedback-preference', left: 'Prefers Direct, Straightforward Feedback', right: 'Values Tactful, Considerate Critique' },
      { id: 'relationship-building', left: 'Builds Relationships Based on Professional Merit', right: 'Values Personal Connection in Working Relationships' },
      { id: 'empathy-approach', left: 'Focuses on Logical Problem Resolution', right: 'Prioritizes Understanding Others\' Perspectives' }
    ]
  }
];
