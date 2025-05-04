import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { USER_TYPES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface JobseekerMatch {
  id: string;
  sliderValues?: Record<string, number>;
  education?: {
    degree?: string;
    major?: string;
    school?: string;
  };
  locations?: string[];
}

interface EmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
}

interface MatchCardProps {
  userType: string;
  data: JobseekerMatch | EmployerMatch;
  onInterested: (id: string) => void;
  onNotInterested: (id: string) => void;
  isPending?: boolean;
}

export default function MatchCard({ userType, data, onInterested, onNotInterested, isPending = false }: MatchCardProps) {
  if (userType === USER_TYPES.JOBSEEKER) {
    const employer = data as EmployerMatch;
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    
    // Swipe functionality
    const controls = useAnimation();
    const x = useMotionValue(0);
    const cardRef = useRef<HTMLDivElement>(null);
    
    // Calculate rotation based on swipe distance
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    
    // Visual indicators that appear during swipe
    const leftIndicatorOpacity = useTransform(x, [-100, -10], [1, 0]);
    const rightIndicatorOpacity = useTransform(x, [10, 100], [0, 1]);
    
    // Handle drag end
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100; // Distance required to trigger swipe action
      
      if (isPending) return;
      
      if (info.offset.x > threshold) {
        // Swipe right - Interested
        controls.start({ 
          x: 500, 
          transition: { duration: 0.3 }
        }).then(() => {
          onInterested(employer.id);
        });
      } else if (info.offset.x < -threshold) {
        // Swipe left - Not interested
        controls.start({ 
          x: -500, 
          transition: { duration: 0.3 }
        }).then(() => {
          onNotInterested(employer.id);
        });
      } else {
        // Not enough swipe distance, return to center
        controls.start({ 
          x: 0, 
          transition: { type: 'spring', stiffness: 500, damping: 30 }
        });
      }
    };
    
    return (
      <>
        <div className="relative mx-auto max-w-md overflow-hidden select-none touchAction-none">
          {/* Card container */}
          <motion.div
            ref={cardRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate }}
            animate={controls}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            className="relative bg-white shadow-md rounded-lg overflow-hidden touch-none"
          >
            {/* Swipe indicators */}
            <motion.div 
              className="absolute top-4 left-4 z-10 bg-red-500 text-white p-2 rounded-full shadow-lg"
              style={{ opacity: leftIndicatorOpacity }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.div>
            
            <motion.div 
              className="absolute top-4 right-4 z-10 bg-green-500 text-white p-2 rounded-full shadow-lg"
              style={{ opacity: rightIndicatorOpacity }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </motion.div>
            
            <img 
              className="h-48 w-full object-cover" 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Company building"
            />
            
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                  {employer.logo ? (
                    <img src={employer.logo} alt={`${employer.name} logo`} className="h-8 w-8" />
                  ) : (
                    <span className="text-lg font-bold text-gray-700">{getInitials(employer.name)}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">{employer.name}</h4>
                  <p className="text-gray-600 text-sm">{employer.location}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">
                  {employer.description}
                </p>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Hiring for</h5>
                <div className="flex flex-wrap gap-2">
                  {employer.positions.map((position, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {position}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-2">
                <Button
                  onClick={() => setIsProfileDialogOpen(true)}
                  variant="ghost"
                  className="text-primary hover:text-primary/90"
                >
                  View Full Profile
                </Button>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button
                  onClick={() => onNotInterested(employer.id)}
                  disabled={isPending}
                  variant="outline"
                  className="flex-1 mr-2 border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Not Interested
                </Button>
                <Button
                  onClick={() => onInterested(employer.id)}
                  disabled={isPending}
                  className="flex-1 ml-2 bg-primary border border-transparent rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-white hover:bg-primary-600"
                >
                  <svg className="h-5 w-5 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Interested
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Swipe instructions hint */}
          <div className="text-center mt-3 text-sm text-gray-500">
            Swipe right to show interest, left to pass
          </div>
        </div>

        {/* Full Employer Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{employer.name}</DialogTitle>
              <DialogDescription>
                Complete company profile and details
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="pr-4">
              <div className="space-y-6">
                {/* Company details */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                      {employer.logo ? (
                        <img src={employer.logo} alt={`${employer.name} logo`} className="h-10 w-10" />
                      ) : (
                        <span className="text-xl font-bold text-gray-700">{getInitials(employer.name)}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-2xl font-semibold text-gray-900">{employer.name}</h4>
                      <p className="text-gray-600">{employer.location}</p>
                    </div>
                  </div>
                </div>
                
                {/* Company description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About the Company</h3>
                  <p className="text-gray-700">
                    {employer.description}
                  </p>
                </div>
                
                {/* Open positions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Open Positions</h3>
                  <div className="flex flex-wrap gap-2">
                    {employer.positions.map((position, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Benefits section (hardcoded for now) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Competitive salary and benefits package</li>
                    <li>Professional development opportunities</li>
                    <li>Collaborative and inclusive work environment</li>
                    <li>Work-life balance</li>
                  </ul>
                </div>
                
                {/* Company culture section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Company Culture</h3>
                  <p className="text-gray-700">
                    We're looking for talented individuals who thrive in a collaborative environment 
                    and are passionate about making a difference. Our culture values innovation, 
                    inclusivity, and continuous learning.
                  </p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      onNotInterested(employer.id);
                    }}
                    variant="outline"
                    className="flex-1 mr-2"
                  >
                    Not Interested
                  </Button>
                  <Button
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      onInterested(employer.id);
                    }}
                    className="flex-1 ml-2"
                  >
                    Interested
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    // Employer viewing jobseeker
    const jobseeker = data as JobseekerMatch;
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    
    // Swipe functionality
    const controls = useAnimation();
    const x = useMotionValue(0);
    const cardRef = useRef<HTMLDivElement>(null);
    
    // Calculate rotation based on swipe distance
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    
    // Visual indicators that appear during swipe
    const leftIndicatorOpacity = useTransform(x, [-100, -10], [1, 0]);
    const rightIndicatorOpacity = useTransform(x, [10, 100], [0, 1]);
    
    // Handle drag end
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100; // Distance required to trigger swipe action
      
      if (isPending) return;
      
      if (info.offset.x > threshold) {
        // Swipe right - Interested
        controls.start({ 
          x: 500, 
          transition: { duration: 0.3 }
        }).then(() => {
          onInterested(jobseeker.id);
        });
      } else if (info.offset.x < -threshold) {
        // Swipe left - Not interested
        controls.start({ 
          x: -500, 
          transition: { duration: 0.3 }
        }).then(() => {
          onNotInterested(jobseeker.id);
        });
      } else {
        // Not enough swipe distance, return to center
        controls.start({ 
          x: 0, 
          transition: { type: 'spring', stiffness: 500, damping: 30 }
        });
      }
    };
    
    // Select a few key sliders from the database to display
    const sliderSamples = [
      // Work Style Preferences
      { id: 'speed_vs_precision', left: 'Methodical & Steady', right: 'Fast-Paced & Dynamic' },
      { id: 'work_life_integration_vs_separation', left: 'Clear Work/Life Separation', right: 'Work/Life Integration' },
      // Collaboration & Communication
      { id: 'collaborative_vs_individual', left: 'Independent Work', right: 'Collaborative Work' },
      // Leadership Preferences
      { id: 'hierarchy_vs_flat', left: 'Structured Leadership', right: 'Flexible Leadership' },
      // Feedback Style
      { id: 'critique_vs_praise', left: 'Direct Feedback', right: 'Diplomatic Feedback' }
    ];
    
    // For debugging - log all available slider values from the database
    console.log('Jobseeker slider values:', jobseeker.sliderValues);
    
    // Function to create sliders categories dynamically based on what's available in the data
    const createSliderCategories = () => {
      // Get all available slider keys from the jobseeker profile
      const availableSliders = jobseeker.sliderValues ? Object.keys(jobseeker.sliderValues) : [];
      
      console.log("Available sliders from database:", availableSliders);
      
      // Map directly to our current schema fields used in the database
      const sliderDefinitions: Record<string, {left: string, right: string, category: string}> = {
        // Current fields in our database
        'noise_vs_quiet': { left: 'Quiet Environment', right: 'Lively Environment', category: 'Work Environment' },
        'formal_vs_casual': { left: 'Formal Style', right: 'Casual Style', category: 'Work Style' },
        'visual_vs_verbal': { left: 'Visual Learner', right: 'Verbal Learner', category: 'Communication' },
        'hierarchy_vs_flat': { left: 'Structured Leadership', right: 'Flexible Leadership', category: 'Leadership & Management' },
        'risk_vs_stability': { left: 'Stability Focused', right: 'Risk Taking', category: 'Decision Making' },
        'critique_vs_praise': { left: 'Direct Feedback', right: 'Diplomatic Feedback', category: 'Communication' },
        'hands_on_vs_theory': { left: 'Theoretical Work', right: 'Hands-on Work', category: 'Work Style' },
        'outcome_vs_process': { left: 'Process Oriented', right: 'Outcome Oriented', category: 'Work Style' },
        'social_vs_reserved': { left: 'Reserved Style', right: 'Social Style', category: 'Work Style' },
        'speed_vs_precision': { left: 'Methodical & Steady', right: 'Fast-Paced & Dynamic', category: 'Work Style' },
        'variety_vs_routine': { left: 'Consistent Routine', right: 'Varied Tasks', category: 'Work Style' },
        'adaptable_vs_focused': { left: 'Focused Approach', right: 'Adaptable Approach', category: 'Work Style' },
        'reflection_vs_action': { left: 'Action Oriented', right: 'Reflection Oriented', category: 'Decision Making' },
        'autonomous_vs_aligned': { left: 'Team Aligned', right: 'Autonomous', category: 'Work Style' },
        'detail_vs_big_picture': { left: 'Detail Oriented', right: 'Big Picture', category: 'Work Style' },
        'learning_vs_executing': { left: 'Execution Focused', right: 'Learning Focused', category: 'Growth & Development' },
        'strategic_vs_tactical': { left: 'Tactical Focus', right: 'Strategic Focus', category: 'Decision Making' },
        'competition_vs_harmony': { left: 'Team Harmony', right: 'Healthy Competition', category: 'Team Dynamics' },
        'creative_vs_analytical': { left: 'Analytical Thinking', right: 'Creative Thinking', category: 'Problem Solving' },
        'decisive_vs_deliberate': { left: 'Deliberate Decisions', right: 'Decisive Action', category: 'Decision Making' },
        'experimental_vs_proven': { left: 'Proven Approaches', right: 'Experimental', category: 'Innovation' },
        'initiative_vs_direction': { left: 'Clear Direction', right: 'Taking Initiative', category: 'Work Style' },
        'objective_vs_subjective': { left: 'Objective Approach', right: 'Subjective Perspective', category: 'Decision Making' },
        'schedule_vs_flexibility': { left: 'Fixed Schedule', right: 'Flexible Schedule', category: 'Work-Life Balance' },
        'innovation_vs_convention': { left: 'Conventional Approach', right: 'Innovative Approach', category: 'Innovation' },
        'specialist_vs_generalist': { left: 'Specialist', right: 'Generalist', category: 'Work Style' },
        'teamwork_vs_independence': { left: 'Independent Work', right: 'Team Collaboration', category: 'Team Dynamics' },
        'self_promotion_vs_modesty': { left: 'Modest Approach', right: 'Self-Promotion', category: 'Communication Style' },
        'collaborative_vs_individual': { left: 'Independent Work', right: 'Collaborative Work', category: 'Team Dynamics' },
        'work_life_integration_vs_separation': { left: 'Clear Work/Life Separation', right: 'Work/Life Integration', category: 'Work-Life Balance' },
        
        // Legacy mapping for completeness
        // Work Environment - these are commented out as they're duplicates from above
        // 'noise_vs_quiet': { left: 'Quiet Environment', right: 'Lively Environment', category: 'Work Environment' },
        'open_office_vs_private': { left: 'Private Workspace', right: 'Open Office', category: 'Work Environment' },
        'remote_vs_inoffice': { left: 'Remote Work', right: 'In-Office Work', category: 'Work Environment' },
        
        // Work Style
        'fast_paced_vs_methodical': { left: 'Methodical & Steady', right: 'Fast-Paced & Dynamic', category: 'Work Style' },
        'multitasking_vs_focused': { left: 'Deep Focus', right: 'Multitasking', category: 'Work Style' },
        'structured_vs_flexible': { left: 'Structured Work', right: 'Flexible Work', category: 'Work Style' },
        'detailed_vs_concise': { left: 'Detail-Oriented', right: 'Big Picture', category: 'Work Style' },
        'quick_vs_thorough': { left: 'Thorough Approach', right: 'Quick Results', category: 'Work Style' },
        'detail_oriented_vs_big_picture': { left: 'Detail-Oriented', right: 'Big Picture', category: 'Work Style' },
        
        // Work-Life Balance
        'work_life_separation_vs_integration': { left: 'Work/Life Separation', right: 'Work/Life Integration', category: 'Work-Life Balance' },
        'flexible_hours_vs_fixed': { left: 'Fixed Schedule', right: 'Flexible Hours', category: 'Work-Life Balance' },
        'overtime_willingness': { left: 'Standard Hours', right: 'Willing to Work Overtime', category: 'Work-Life Balance' },
        'travel_preference': { left: 'Minimal Travel', right: 'Frequent Travel', category: 'Work-Life Balance' },
        
        // Communication
        'written_vs_verbal': { left: 'Written Communication', right: 'Verbal Communication', category: 'Communication' },
        'formal_vs_casual_comm': { left: 'Formal Communication', right: 'Casual Communication', category: 'Communication' },
        'direct_vs_diplomatic': { left: 'Direct Communication', right: 'Diplomatic Communication', category: 'Communication' },
        'frequent_vs_as_needed': { left: 'Communication As Needed', right: 'Frequent Check-ins', category: 'Communication' },
        
        // Collaboration
        'collaborative_vs_independent': { left: 'Independent Work', right: 'Collaborative Work', category: 'Collaboration' },
        'consensus_vs_decisive': { left: 'Decisive Action', right: 'Consensus Building', category: 'Collaboration' },
        'group_input_vs_individual': { left: 'Individual Decision-Making', right: 'Group Input', category: 'Collaboration' },
        'competitive_vs_collaborative_culture': { left: 'Competitive Culture', right: 'Collaborative Culture', category: 'Collaboration' },
        
        // Management & Leadership
        'hands_on_vs_delegating': { left: 'Delegating Management', right: 'Hands-On Management', category: 'Management & Leadership' },
        'hierarchical_vs_flat': { left: 'Hierarchical Structure', right: 'Flat Structure', category: 'Management & Leadership' },
        'directive_vs_empowering': { left: 'Directive Leadership', right: 'Empowering Leadership', category: 'Management & Leadership' },
        'formal_vs_informal_leadership': { left: 'Formal Leadership', right: 'Informal Leadership', category: 'Management & Leadership' },
        
        // Decision-Making
        'analytical_vs_intuitive': { left: 'Analytical Approach', right: 'Intuitive Approach', category: 'Decision-Making' },
        'data_driven_vs_intuition': { left: 'Data-Driven Decisions', right: 'Intuition-Based Decisions', category: 'Decision-Making' },
        'risk_taking_vs_cautious': { left: 'Cautious Approach', right: 'Risk-Taking Approach', category: 'Decision-Making' },
        'risk_averse_vs_risk_seeking': { left: 'Risk-Averse', right: 'Risk-Seeking', category: 'Decision-Making' },
        'pragmatic_vs_idealistic': { left: 'Pragmatic Approach', right: 'Idealistic Approach', category: 'Decision-Making' },
        
        // Personal Growth & Development
        'growth_vs_stability': { left: 'Stability', right: 'Growth & Development', category: 'Growth & Development' },
        'professional_development_time': { left: 'Focused on Current Tasks', right: 'Professional Development Time', category: 'Growth & Development' },
        'mentorship_vs_peer_learning': { left: 'Peer Learning', right: 'Mentorship', category: 'Growth & Development' },
        'regular_feedback_vs_autonomy': { left: 'Autonomy', right: 'Regular Feedback', category: 'Growth & Development' },
        
        // Values & Culture
        'casual_vs_formal': { left: 'Formal Environment', right: 'Casual Environment', category: 'Values & Culture' },
        'innovation_vs_tradition': { left: 'Traditional Approach', right: 'Innovative Approach', category: 'Values & Culture' },
        'profit_vs_purpose': { left: 'Profit-Driven', right: 'Purpose-Driven', category: 'Values & Culture' },
        'transparency_vs_privacy': { left: 'Privacy', right: 'Transparency', category: 'Values & Culture' },
        'company_loyalty_vs_industry_mobility': { left: 'Industry Mobility', right: 'Company Loyalty', category: 'Values & Culture' },
        'traditional_vs_progressive': { left: 'Traditional Culture', right: 'Progressive Culture', category: 'Values & Culture' },
        'global_vs_local': { left: 'Local Focus', right: 'Global Focus', category: 'Values & Culture' },
        'customer_vs_employee_first': { left: 'Employee-First', right: 'Customer-First', category: 'Values & Culture' },
        'financial_vs_social_impact': { left: 'Financial Impact', right: 'Social Impact', category: 'Values & Culture' },
        'challenging_vs_supportive': { left: 'Supportive Environment', right: 'Challenging Environment', category: 'Values & Culture' },
        'performance_vs_potential': { left: 'Focus on Potential', right: 'Focus on Performance', category: 'Values & Culture' },
      };

      // Define priority sliders for each category to ensure important ones are shown first
      const prioritySliders: Record<string, string[]> = {
        'Work Environment': ['noise_vs_quiet', 'remote_vs_inoffice', 'open_office_vs_private'],
        'Work Style': ['fast_paced_vs_methodical', 'structured_vs_flexible', 'multitasking_vs_focused', 'detailed_vs_concise', 'quick_vs_thorough'],
        'Work-Life Balance': ['work_life_separation_vs_integration', 'flexible_hours_vs_fixed', 'overtime_willingness', 'travel_preference'],
        'Communication': ['written_vs_verbal', 'formal_vs_casual_comm', 'direct_vs_diplomatic', 'frequent_vs_as_needed'],
        'Collaboration': ['collaborative_vs_independent', 'consensus_vs_decisive', 'competitive_vs_collaborative_culture'],
        'Management & Leadership': ['hands_on_vs_delegating', 'hierarchical_vs_flat', 'directive_vs_empowering', 'formal_vs_informal_leadership'],
        'Decision-Making': ['analytical_vs_intuitive', 'data_driven_vs_intuition', 'risk_taking_vs_cautious', 'pragmatic_vs_idealistic'],
        'Growth & Development': ['growth_vs_stability', 'professional_development_time', 'mentorship_vs_peer_learning', 'regular_feedback_vs_autonomy'],
        'Values & Culture': ['profit_vs_purpose', 'innovation_vs_tradition', 'transparency_vs_privacy', 'financial_vs_social_impact', 'traditional_vs_progressive']
      };
      
      // Group sliders by category
      const categorizedSliders: Record<string, Array<{id: string, left: string, right: string}>> = {};
      
      // First process sliders based on priority
      Object.entries(prioritySliders).forEach(([category, priorityList]) => {
        if (!categorizedSliders[category]) {
          categorizedSliders[category] = [];
        }
        
        // Add priority sliders that exist in the data
        priorityList.forEach(sliderId => {
          if (availableSliders.includes(sliderId) && sliderDefinitions[sliderId]) {
            const def = sliderDefinitions[sliderId];
            categorizedSliders[category].push({
              id: sliderId,
              left: def.left,
              right: def.right
            });
          }
        });
      });
      
      // Then add any remaining sliders
      availableSliders.forEach(sliderId => {
        // Skip if the slider definition is not found
        if (!sliderDefinitions[sliderId]) return;
        
        const def = sliderDefinitions[sliderId];
        const category = def.category;
        
        if (!categorizedSliders[category]) {
          categorizedSliders[category] = [];
        }
        
        // Check if this slider is already added (from priority list)
        const alreadyAdded = categorizedSliders[category].some(slider => slider.id === sliderId);
        if (!alreadyAdded) {
          categorizedSliders[category].push({
            id: sliderId,
            left: def.left,
            right: def.right
          });
        }
      });
      
      // Define category order for consistent presentation
      const categoryOrder = [
        'Work Style',
        'Work Environment',
        'Work-Life Balance',
        'Communication',
        'Collaboration',
        'Management & Leadership',
        'Decision-Making',
        'Growth & Development',
        'Values & Culture'
      ];
      
      // Convert to array of categories and limit to 5 sliders per category max
      const categoriesArray = Object.entries(categorizedSliders).map(([name, sliders]) => ({
        name,
        sliders: sliders.slice(0, 5) // Limit to 5 sliders per category for consistency
      }));
      
      // Sort by defined order (if category exists in the order array)
      return categoriesArray.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.name);
        const indexB = categoryOrder.indexOf(b.name);
        
        // If both categories are in our defined order, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one is in the defined order, prioritize that one
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // If neither is in our defined order, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    };
    
    // Create categories dynamically based on the available data
    const allSliderCategories = createSliderCategories();
    
    return (
      <>
        <div className="relative mx-auto max-w-md overflow-hidden select-none touchAction-none">
          {/* Card container */}
          <motion.div
            ref={cardRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate }}
            animate={controls}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            className="relative bg-white shadow-md rounded-lg overflow-hidden touch-none"
          >
            {/* Swipe indicators */}
            <motion.div 
              className="absolute top-4 left-4 z-10 bg-red-500 text-white p-2 rounded-full shadow-lg"
              style={{ opacity: leftIndicatorOpacity }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.div>
            
            <motion.div 
              className="absolute top-4 right-4 z-10 bg-green-500 text-white p-2 rounded-full shadow-lg"
              style={{ opacity: rightIndicatorOpacity }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </motion.div>
          
            <div className="px-5 pt-5">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">Anonymous Profile</h4>
                  <p className="text-gray-600 text-sm">{jobseeker.education?.major || 'Early Career'} Student</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Education</h5>
                  <p className="text-sm text-gray-900">
                    {jobseeker.education?.degree || 'Degree not specified'}<br />
                    {jobseeker.education?.major || 'Major not specified'}<br />
                    {jobseeker.education?.school || 'School not specified'}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Location Preferences</h5>
                  <p className="text-sm text-gray-900">
                    {jobseeker.locations && jobseeker.locations.length > 0 ? (
                      <>
                        {jobseeker.locations.slice(0, 3).map((loc, i) => (
                          <React.Fragment key={i}>
                            {loc}<br />
                          </React.Fragment>
                        ))}
                        {jobseeker.locations.length > 3 && '...'}
                      </>
                    ) : (
                      'No locations specified'
                    )}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Work & Interpersonal Style</h5>
                
                {sliderSamples.map((slider) => (
                  <div key={slider.id} className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{slider.left}</span>
                      <span>{slider.right}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-primary rounded" 
                        style={{ 
                          width: `${(jobseeker.sliderValues && jobseeker.sliderValues[slider.id]) || 50}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mb-3">
                <button 
                  type="button" 
                  className="w-full text-sm text-primary hover:text-primary/80 font-medium"
                  onClick={() => setIsProfileDialogOpen(true)}
                >
                  View complete profile
                </button>
              </div>
              
              <div className="mt-4 flex justify-between pb-5">
                <Button
                  onClick={() => onNotInterested(jobseeker.id)}
                  disabled={isPending}
                  variant="outline"
                  className="flex-1 mr-2 border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Not Interested
                </Button>
                <Button
                  onClick={() => onInterested(jobseeker.id)}
                  disabled={isPending}
                  className="flex-1 ml-2 bg-primary border border-transparent rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-white hover:bg-primary-600"
                >
                  <svg className="h-5 w-5 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Interested
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Swipe instructions hint */}
          <div className="text-center mt-3 text-sm text-gray-500">
            Swipe right to show interest, left to pass
          </div>
        </div>
        
        {/* Full Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Candidate Profile</DialogTitle>
              <DialogDescription>
                This is an anonymized profile showing the candidate's preferences and compatibility metrics.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-lg font-medium">Education</h3>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">Degree</p>
                      <p>{jobseeker.education?.degree || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">Major</p>
                      <p>{jobseeker.education?.major || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">School</p>
                      <p>{jobseeker.education?.school || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Location Preferences</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {jobseeker.locations && jobseeker.locations.length > 0 ? (
                      jobseeker.locations.map((location, index) => (
                        <div key={index} className="p-2 bg-muted rounded-md">
                          {location}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-muted rounded-md col-span-2">
                        No location preferences specified
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Work & Compatibility Profile</h3>
                  <div className="mt-4">
                    <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                      {allSliderCategories.map((category, categoryIndex) => (
                        <AccordionItem key={categoryIndex} value={`item-${categoryIndex}`}>
                          <AccordionTrigger className="font-medium text-md">
                            {category.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {category.sliders.map((slider, sliderIndex) => (
                                <div key={sliderIndex} className="mb-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{slider.left}</span>
                                    <span>{slider.right}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded">
                                    <div 
                                      className="h-2 bg-primary rounded" 
                                      style={{ 
                                        width: `${(jobseeker.sliderValues && jobseeker.sliderValues[slider.id]) || 50}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => setIsProfileDialogOpen(false)}>Close</Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}
