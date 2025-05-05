import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { USER_TYPES, SLIDER_CATEGORIES } from '@/lib/constants';
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
import enternLogo from '@assets/entern.png';

interface JobseekerMatch {
  id: string;
  sliderValues?: Record<string, number>;
  education?: {
    degree?: string;
    major?: string;
    school?: string;
  };
  locations?: string[];
  workArrangements?: string[];
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
    // Jobseeker viewing employer
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
            
            {/* Company header banner instead of photo */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center p-6">
              <h3 className="text-2xl font-bold text-center text-primary-foreground">{employer.name}</h3>
            </div>
            
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
              <div className="flex items-center justify-between">
                <DialogTitle>{employer.name}</DialogTitle>
                <img src={enternLogo} alt="enterN logo" className="h-8" />
              </div>
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
    
    // For debugging - log all available slider values from the database
    console.log('Jobseeker slider values:', jobseeker.sliderValues);
    console.log('Available sliders from database:', jobseeker.sliderValues ? Object.keys(jobseeker.sliderValues) : []);
    
    // Create a header based on major or other criteria
    const profileHeader = () => {
      if (jobseeker.education?.major && jobseeker.education?.school) {
        return `${jobseeker.education.major} Student`;
      } else if (jobseeker.education?.major) {
        return `${jobseeker.education.major} Student`;
      } else {
        return "Entry-Level Jobseeker";
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
            
            {/* Profile header */}
            <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center p-6">
              <h3 className="text-2xl font-bold text-center text-primary-foreground">{profileHeader()}</h3>
            </div>
            
            <div className="p-5">
              {/* Education summary */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Education</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p><span className="font-medium">School:</span> {jobseeker.education?.school || 'Not specified'}</p>
                  <p><span className="font-medium">Degree:</span> {jobseeker.education?.degree || 'Not specified'}</p>
                  <p><span className="font-medium">Major:</span> {jobseeker.education?.major || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Location preferences */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {jobseeker.locations && jobseeker.locations.length > 0 ? (
                    jobseeker.locations.map((location, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {location}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600">No location preferences specified</p>
                  )}
                </div>
              </div>
              
              {/* Work arrangements */}
              {jobseeker.workArrangements && jobseeker.workArrangements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Work Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobseeker.workArrangements.map((arrangement, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {arrangement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-center mb-2">
                <Button
                  onClick={() => setIsProfileDialogOpen(true)}
                  variant="ghost"
                  className="text-primary hover:text-primary/90"
                >
                  View Complete Profile
                </Button>
              </div>
              
              <div className="mt-4 flex justify-between">
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
              <div className="flex items-center justify-between">
                <DialogTitle>Complete Candidate Profile</DialogTitle>
                <img src={enternLogo} alt="enterN logo" className="h-8" />
              </div>
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
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                      {SLIDER_CATEGORIES.map((category, categoryIdx) => (
                        <AccordionItem key={category.id} value={`item-${categoryIdx}`}>
                          <AccordionTrigger className="font-medium text-md">
                            {category.name}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {category.sliders.map((slider) => (
                                <div key={slider.id} className="mb-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span className="text-left pr-2 max-w-[45%] whitespace-pre-wrap">
                                      {slider.leftLabel}
                                    </span>
                                    <span className="text-right pl-2 max-w-[45%] whitespace-pre-wrap">
                                      {slider.rightLabel}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded">
                                    <div 
                                      className="h-2 bg-primary rounded" 
                                      style={{ 
                                        width: `${(jobseeker.sliderValues && jobseeker.sliderValues[slider.id]) || 50}%` 
                                      }}
                                    />
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
                
                <div className="pt-4 flex justify-between">
                  <Button
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      onNotInterested(jobseeker.id);
                    }}
                    variant="outline"
                    className="flex-1 mr-2"
                  >
                    Not Interested
                  </Button>
                  <Button
                    onClick={() => {
                      setIsProfileDialogOpen(false);
                      onInterested(jobseeker.id);
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
  }
}