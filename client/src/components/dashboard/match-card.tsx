import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { USER_TYPES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';

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
            
            <div className="mt-6 flex justify-between">
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
    
    // Select a few key sliders to display from different categories
    const sliderSamples = [
      // Work Style Preferences
      { id: 'work-pace', left: 'Methodical & Steady', right: 'Fast-Paced & Dynamic' },
      { id: 'work-life-balance', left: 'Clear Work/Life Separation', right: 'Work/Life Integration' },
      // Collaboration & Communication
      { id: 'team-composition', left: 'Homogeneous Teams', right: 'Diverse Perspectives' },
      // Leadership & Supervisor Styles
      { id: 'management-style', left: 'Structured Leadership', right: 'Autonomous Leadership' },
      // Problem-Solving & Decision-Making
      { id: 'feedback-style', left: 'Direct Feedback', right: 'Diplomatic Feedback' }
    ];
    
    // Expanded list of slider categories for the full profile view
    const allSliderCategories = [
      {
        name: "Work Style Preferences",
        sliders: [
          { id: 'work-pace', left: 'Methodical & Steady', right: 'Fast-Paced & Dynamic' },
          { id: 'work-life-balance', left: 'Clear Work/Life Separation', right: 'Work/Life Integration' },
          { id: 'work-environment', left: 'Quiet & Focused', right: 'Lively & Collaborative' },
          { id: 'work-autonomy', left: 'Clear Directions', right: 'Self-Directed Work' }
        ]
      },
      {
        name: "Collaboration & Communication",
        sliders: [
          { id: 'team-composition', left: 'Homogeneous Teams', right: 'Diverse Perspectives' },
          { id: 'communication-style', left: 'Structured Communication', right: 'Organic Communication' },
          { id: 'collaboration-preference', left: 'Independent Work', right: 'Collaborative Work' }
        ]
      },
      {
        name: "Leadership & Supervisor Styles",
        sliders: [
          { id: 'management-style', left: 'Structured Leadership', right: 'Autonomous Leadership' },
          { id: 'supervisor-availability', left: 'Hands-Off Supervision', right: 'Hands-On Supervision' },
          { id: 'feedback-frequency', left: 'Scheduled Feedback', right: 'Continuous Feedback' }
        ]
      },
      {
        name: "Problem-Solving & Decision-Making",
        sliders: [
          { id: 'feedback-style', left: 'Direct Feedback', right: 'Diplomatic Feedback' },
          { id: 'decision-making', left: 'Data-Driven Decisions', right: 'Intuitive Decisions' },
          { id: 'risk-tolerance', left: 'Risk-Averse', right: 'Risk-Taking' }
        ]
      }
    ];
    
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
                  <div className="mt-4 space-y-6">
                    {allSliderCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="space-y-3">
                        <h4 className="font-medium text-md">{category.name}</h4>
                        
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
                    ))}
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
