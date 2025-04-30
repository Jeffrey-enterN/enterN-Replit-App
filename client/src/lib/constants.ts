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
      { id: 'working-style-schedule', left: 'Prefers a Consistent, Fixed Work Schedule', right: 'Values Flexible, Adaptive Working Hours' },
      { id: 'working-style-documentation', left: 'Values Comprehensive Documentation and Processes', right: 'Prefers Minimal Administrative Overhead' },
      { id: 'working-style-workflow', left: 'Thrives on Repetitive, Predictable Tasks', right: 'Enjoys a Variety of Task Types and Challenges' },
      { id: 'working-style-communication', left: 'Prefers Regular Team Check-Ins', right: 'Values Minimal Interruptions for Deep Work' },
      { id: 'working-style-execution', left: 'Favors a Step-by-Step, Methodical Approach', right: 'Prefers Quick Experimentation and Iterative Processes' },
      { id: 'working-style-routine', left: 'Highly Structured Daily Routine', right: 'Flexible, Self-Paced Work Environment' },
      { id: 'working-style-guidance', left: 'Preference for Step-by-Step Instructions', right: 'Desire for Independent Decision-Making' },
      { id: 'working-style-teamorientation', left: 'Collaborative, Group-Driven Work', right: 'Independent, Solo Work Preference' },
      { id: 'working-style-plannedflow', left: 'Reliance on Detailed Planning', right: 'Adaptability to Spontaneous Tasks' },
      { id: 'working-style-processes', left: 'Following Established Processes', right: 'Tailoring Methods to the Situation' }
    ]
  },
  {
    id: 'leadership-style',
    title: 'Preferred Leadership & Supervisor Styles',
    sliders: [
      { id: 'leadership-style-policy-rigor', left: 'Strict Adherence to Policies', right: 'Adaptable to Situations' },
      { id: 'leadership-style-mentorship', left: 'Emphasis on Formal Training & Mentorship', right: 'Preference for Independent Learning' },
      { id: 'leadership-style-approach', left: 'Taskmaster & Transparent Guidance', right: 'Hands-Off & Ambiguous Support' },
      { id: 'leadership-style-recognition', left: 'Prefers Public Acknowledgment', right: 'Favors Private Recognition' },
      { id: 'leadership-style-team-environment', left: 'Encourages Competition Among Team Members', right: 'Fosters a Collaborative Team Spirit' },
      { id: 'leadership-style-boundaries', left: 'Sets Firm Boundaries', right: 'Always Accessible for Support' },
      { id: 'leadership-style-coaching', left: 'Prefers Leaders Who Coach Actively', right: 'Values Leaders Who Grant Independent Decision-Making' },
      { id: 'leadership-style-feedback', left: 'Expects Scheduled, Formalized Feedback', right: 'Values Informal, Spontaneous Feedback' },
      { id: 'leadership-style-role-definition', left: 'Prefers Clearly Defined Roles and Responsibilities', right: 'Comfortable with Evolving Role Expectations' },
      { id: 'leadership-style-process-outcome', left: 'Values Leaders Who Emphasize Process and Procedure', right: 'Favors Leaders Focused on Results and Outcomes' },
      { id: 'leadership-style-risk', left: 'Prefers Leaders Who Avoid Risk', right: 'Values Leaders Who Embrace Calculated Risks' }
    ]
  },
  {
    id: 'work-environment',
    title: 'Preferred Work Environment',
    sliders: [
      { id: 'work-environment-setting', left: 'Quiet, Controlled Workspace', right: 'Dynamic, Open-Plan Environment' },
      { id: 'work-environment-structure', left: 'Traditional, Hierarchical Office Setting', right: 'Casual, Flat Organizational Structure' },
      { id: 'work-environment-variety', left: 'Predictable, Routine-Based Environment', right: 'Ever-Changing, Fast-Paced Atmosphere' },
      { id: 'work-environment-stability', left: 'Stable, Consistent Work Conditions', right: 'Variety and Spontaneity in Tasks' },
      { id: 'work-environment-interactions', left: 'Minimal Social Interactions', right: 'Lively, Collaborative Workspaces' },
      { id: 'work-environment-workspace', left: 'Prefers Private, Quiet Workspaces', right: 'Thrives in Open, Collaborative Settings' },
      { id: 'work-environment-change', left: 'Values a Consistent, Unchanging Workspace', right: 'Enjoys Switching Between Different Work Settings (office, remote, co-working)' },
      { id: 'work-environment-atmosphere', left: 'Prefers a Formal, Professional Office', right: 'Values a Relaxed, Casual Work Culture' },
      { id: 'work-environment-tech-setup', left: 'Favors a Conventional Office Layout', right: 'Embraces a Modern, Innovative Workspace with the Latest Tech' },
      { id: 'work-environment-scheduling', left: 'Prefers Regular, Predictable Work Patterns', right: 'Excels in Environments Driven by Projects or Events' }
    ]
  },
  {
    id: 'collaboration-style',
    title: 'Collaboration & Communication Style Preferences',
    sliders: [
      { id: 'collaboration-style-direct-communication', left: 'Direct, Clear-Cut Communication', right: 'Nuanced, Contextual Dialogue' },
      { id: 'collaboration-style-meeting-style', left: 'Structured, Scheduled Meetings', right: 'Casual, Ad-Hoc Discussions' },
      { id: 'collaboration-style-work-independence', left: 'Regular, Frequent Updates', right: 'Minimal Interruptions and Independence' },
      { id: 'collaboration-style-communication-medium', left: 'Preference for Written Communication', right: 'Preference for Face-to-Face or Verbal Exchanges' },
      { id: 'collaboration-style-preference', left: 'Open, Group Collaboration', right: 'Selective, One-on-One Interactions' },
      { id: 'collaboration-style-scheduling', left: 'Prefers Pre-Planned Communication Sessions', right: 'Values Spontaneous, Impromptu Discussions' },
      { id: 'collaboration-style-formality', left: 'Values Formal, Documented Communication', right: 'Prefers Informal, Real-Time Messaging' },
      { id: 'collaboration-style-cross-functional', left: 'Enjoys Collaborating Across Different Teams', right: 'Prefers Working Within a Single Department' },
      { id: 'collaboration-style-consensus', left: 'Values Group Consensus and Shared Input', right: 'Favors Directives from Leadership in Communication' },
      { id: 'collaboration-style-feedback-channel', left: 'Prefers Organized, Scheduled Feedback Opportunities', right: 'Values an Open-Door Approach for Continuous, Informal Feedback' }
    ]
  },
  {
    id: 'growth-motivation',
    title: 'Growth, Intrinsic Motivation & Development Goals',
    sliders: [
      { id: 'growth-motivation-development-path', left: 'Clear, Formal Career Development Plans', right: 'Self-Directed, Organic Growth Opportunities' },
      { id: 'growth-motivation-source', left: 'Motivated by External Recognition and Incentives', right: 'Driven by Internal Fulfillment and Passion' },
      { id: 'growth-motivation-training-style', left: 'Focused, Specialized Training Programs', right: 'Broad, Exploratory Learning Experiences' },
      { id: 'growth-motivation-achievement-timeline', left: 'Focus on Long-Term Career Progression', right: 'Emphasis on Short-Term, Project-Based Success' },
      { id: 'growth-motivation-success-metrics', left: 'Measured by Formal Performance Metrics', right: 'Success Defined by Personal Growth and Engagement' },
      { id: 'growth-motivation-path', left: 'Values a Clear Hierarchical Career Path', right: 'Prefers Growth Based on Skills and Competence' },
      { id: 'growth-motivation-achievement-learning', left: 'Driven by Achieving Targets and Recognitions', right: 'Motivated by Continuous Learning and Personal Development' },
      { id: 'growth-motivation-benchmarking', left: 'Measures Success Against External Standards', right: 'Values Personal Benchmarks and Self-Reflection' },
      { id: 'growth-motivation-learning-style', left: 'Prefers Organized Training Programs and Workshops', right: 'Favors Self-Guided, Project-Based Learning' },
      { id: 'growth-motivation-goal-focus', left: 'Focused on Measurable, Quantitative Targets', right: 'Driven by the Qualitative Impact and Personal Fulfillment of Work' }
    ]
  },
  {
    id: 'problem-solving',
    title: 'Problem-Solving & Decision-Making',
    sliders: [
      { id: 'problem-solving-approach', left: 'Data-Driven, Analytical Decision Making', right: 'Gut-Feeling, Intuitive Judgments' },
      { id: 'problem-solving-collaborative-decisions', left: 'Group Consensus in Problem Solving', right: 'Independent, Solo Decision Making' },
      { id: 'problem-solving-structured-creative', left: 'Preference for Established Frameworks', right: 'Creative, Flexible Problem-Solving Approaches' },
      { id: 'problem-solving-decision-speed', left: 'Step-by-Step, Methodical Resolution', right: 'Quick, Adaptive Reactions to Challenges' },
      { id: 'problem-solving-consensus-decisive', left: 'Relying on Team Input', right: 'Making Swift, Decisive Choices' },
      { id: 'problem-solving-system-brainstorm', left: 'Prefers a Step-by-Step Analytical Approach', right: 'Enjoys Collaborative Brainstorming for Creative Solutions' },
      { id: 'problem-solving-data-experience', left: 'Bases Decisions on Hard Data and Metrics', right: 'Values Personal Experience and Intuition in Decision-Making' },
      { id: 'problem-solving-incremental-radical', left: 'Favors Small, Incremental Adjustments', right: 'Open to Bold, Transformative Solutions' },
      { id: 'problem-solving-consensus-action', left: 'Prefers Building Consensus with Team Input', right: 'Values Swift, Authoritative Decision-Making' },
      { id: 'problem-solving-risk-opportunity', left: 'Prioritizes Minimizing Risks in Decision-Making', right: 'Focuses on Seizing Opportunities, Even if Involving Some Risk' }
    ]
  },
  {
    id: 'adaptability',
    title: 'Adaptability & Resilience',
    sliders: [
      { id: 'adaptability-change-response', left: 'Prefers a Predictable, Stable Environment', right: 'Thrives in Dynamic, Changing Conditions' },
      { id: 'adaptability-routine-adjustment', left: 'Comfort in Following Established Routines', right: 'Quick to Adapt to New Circumstances' },
      { id: 'adaptability-recovery-speed', left: 'Takes Time to Recover from Setbacks', right: 'Bounces Back Quickly from Challenges' },
      { id: 'adaptability-proactive-reactive', left: 'Prefers to Maintain Current Methods', right: 'Proactively Seeks Change and Innovation' },
      { id: 'adaptability-ambiguity-clarity', left: 'Requires Clear Guidelines in Uncertain Situations', right: 'Comfortable Navigating Ambiguity and Uncertainty' },
      { id: 'adaptability-contingency-impromptu', left: 'Prefers Detailed Contingency Plans for Change', right: 'Comfortable Making Impromptu Adjustments' },
      { id: 'adaptability-learning', left: 'Takes Time to Adjust to New Situations', right: 'Quickly Adapts and Learns from Change' },
      { id: 'adaptability-recovery', left: 'Follows a Clear, Structured Process to Recover from Setbacks', right: 'Uses Creative Strategies to Bounce Back' },
      { id: 'adaptability-uncertainty', left: 'Seeks a Stable and Predictable Environment', right: 'Excels in Uncertain, Ambiguous Conditions' },
      { id: 'adaptability-seeking-change', left: 'Finds Comfort in Established Routines Even When Things Shift', right: 'Actively Seeks New Challenges and Change' }
    ]
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence & Interpersonal Effectiveness',
    sliders: [
      { id: 'emotional-intelligence-sensitivity', left: 'Prioritizes Understanding Others\' Emotions', right: 'Focuses More on Facts and Logic in Interactions' },
      { id: 'emotional-intelligence-expression', left: 'Comfortable Expressing Feelings Openly', right: 'Prefers to Keep Emotions Private' },
      { id: 'emotional-intelligence-listening', left: 'Values Empathetic, Supportive Listening', right: 'Leans Toward Solution-Oriented, Task-Focused Dialogue' },
      { id: 'emotional-intelligence-conflict-resolution', left: 'Seeks Collaborative, Mediated Solutions', right: 'Favors Direct, Assertive Resolution Approaches' },
      { id: 'emotional-intelligence-group-individual', left: 'Emphasizes Maintaining Group Harmony', right: 'Prioritizes Individual Accountability and Direct Feedback' },
      { id: 'emotional-intelligence-empathetic-objective', left: 'Prioritizes Deep Emotional Engagement', right: 'Maintains an Objective, Fact-Focused Interaction' },
      { id: 'emotional-intelligence-conflict-approach', left: 'Tends to Avoid Conflict to Preserve Harmony', right: 'Comfortable Engaging in Constructive Confrontation' },
      { id: 'emotional-intelligence-relationship-task', left: 'Prioritizes Developing Interpersonal Relationships', right: 'Focuses Primarily on Task Completion and Results' },
      { id: 'emotional-intelligence-communication', left: 'Openly Expresses Emotions and Opinions', right: 'Maintains a Reserved, Controlled Demeanor in Interactions' },
      { id: 'emotional-intelligence-resolution', left: 'Prefers Resolving Interpersonal Issues Through Group Discussion', right: 'Tends to Resolve Issues Independently and Privately' }
    ]
  }
];
