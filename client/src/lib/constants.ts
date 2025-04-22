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

export const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'Los Angeles, CA',
  'Remote'
];

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Entertainment',
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
  'Associate\'s',
  'Bachelor\'s',
  'Master\'s',
  'Doctoral'
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
    title: 'Organizational Values & Mission Alignment',
    sliders: [
      { id: 'mission-focus', left: 'Strictly Defined Mission Statements', right: 'Adaptable, Evolving Mission Focus' },
      { id: 'traditional-values', left: 'Emphasis on Legacy & Stability', right: 'Innovative, Risk-Tolerant Values' },
      { id: 'value-communication', left: 'Explicit, Written Value Statements', right: 'Emergent, Informal Value Expression' },
      { id: 'cultural-expectations', left: 'Standardized Organizational Culture', right: 'Diverse, Personalized Cultural Expression' },
      { id: 'goals-stability', left: 'Consistent, Long-Term Goals', right: 'Fluid, Changing Strategic Directions' },
      { id: 'innovation-stability', left: 'Values Stability and Consistency', right: 'Values Continuous Innovation and Change' }
    ]
  },
  {
    id: 'work-style',
    title: 'Work Style Preferences',
    sliders: [
      { id: 'schedule', left: 'Fixed Schedule', right: 'Flexible Hours' },
      { id: 'documentation', left: 'Detailed Documentation', right: 'Minimal Paperwork' },
      { id: 'workflow', left: 'Predictable Workflow', right: 'Varied Tasks' },
      { id: 'communication', left: 'Constant Communication', right: 'Deep Focus' },
      { id: 'execution', left: 'Methodical Execution', right: 'Rapid Iteration' },
      { id: 'routine', left: 'Highly Structured Daily Routine', right: 'Flexible, Self-Paced Work Environment' }
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
      { id: 'feedback', left: 'Expects Scheduled, Formalized Feedback', right: 'Values Informal, Spontaneous Feedback' }
    ]
  },
  {
    id: 'work-environment',
    title: 'Preferred Work Environment',
    sliders: [
      { id: 'setting', left: 'Quiet, Controlled Workspace', right: 'Dynamic, Open-Plan Environment' },
      { id: 'structure', left: 'Traditional, Hierarchical Office Setting', right: 'Casual, Flat Organizational Structure' },
      { id: 'variety', left: 'Predictable, Routine-Based Environment', right: 'Ever-Changing, Fast-Paced Atmosphere' },
      { id: 'interactions', left: 'Minimal Social Interactions', right: 'Lively, Collaborative Workspaces' },
      { id: 'workspace', left: 'Prefers Private, Quiet Workspaces', right: 'Thrives in Open, Collaborative Settings' },
      { id: 'atmosphere', left: 'Prefers a Formal, Professional Office', right: 'Values a Relaxed, Casual Work Culture' }
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
      { id: 'communication-scheduling', left: 'Prefers Pre-Planned Communication Sessions', right: 'Values Spontaneous, Impromptu Discussions' }
    ]
  },
  {
    id: 'growth-motivation',
    title: 'Growth, Intrinsic Motivation & Development Goals',
    sliders: [
      { id: 'development-path', left: 'Clear, Formal Career Development Plans', right: 'Self-Directed, Organic Growth Opportunities' },
      { id: 'motivation-source', left: 'Motivated by External Recognition and Incentives', right: 'Driven by Internal Fulfillment and Passion' },
      { id: 'training-style', left: 'Focused, Specialized Training Programs', right: 'Broad, Exploratory Learning Experiences' },
      { id: 'achievement-timeline', left: 'Focus on Long-Term Career Progression', right: 'Emphasis on Short-Term, Project-Based Success' },
      { id: 'success-metrics', left: 'Measured by Formal Performance Metrics', right: 'Success Defined by Personal Growth and Engagement' },
      { id: 'growth-path', left: 'Values a Clear Hierarchical Career Path', right: 'Prefers Growth Based on Skills and Competence' }
    ]
  }
];
