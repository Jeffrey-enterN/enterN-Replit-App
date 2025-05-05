import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SLIDER_CATEGORIES } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProfilePreviewProps {
  profile: {
    education?: {
      degree?: string;
      major?: string;
      school?: string;
    };
    locations?: string[];
    sliderValues?: Record<string, number>;
  };
  trigger?: React.ReactNode;
}

/**
 * ProfilePreview - Shows jobseekers exactly how their profile appears to employers
 * 
 * This component displays a preview of the jobseeker's profile as it would appear
 * to an employer in a match card. It helps jobseekers understand how their slider
 * selections and other profile information will be presented.
 */
export default function ProfilePreview({ profile, trigger }: ProfilePreviewProps) {
  // Function to organize slider data by category
  const getSlidersByCategory = () => {
    const sliderCategories = SLIDER_CATEGORIES.map((category, index) => {
      // Get sliders that have values in the profile
      const slidersWithValues = category.sliders.filter(slider => 
        profile.sliderValues && profile.sliderValues[slider.id] !== undefined
      );

      return {
        id: category.id,
        name: category.name,
        sliders: slidersWithValues,
        index
      };
    }).filter(category => category.sliders.length > 0);
    
    return sliderCategories;
  };

  const sliderCategories = getSlidersByCategory();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Preview Your Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How Employers See Your Profile</DialogTitle>
          <DialogDescription>
            This is an anonymized preview of how your profile appears to employers in the matching process
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Profile Card Preview */}
            <div className="border rounded-lg p-5 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">Anonymous Profile</h4>
                  <p className="text-gray-600 text-sm">{profile.education?.major || 'Early Career'} Student</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Education</h5>
                  <p className="text-sm text-gray-900">
                    {profile.education?.degree || 'Degree not specified'}<br />
                    {profile.education?.major || 'Major not specified'}<br />
                    {profile.education?.school || 'School not specified'}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Location Preferences</h5>
                  <p className="text-sm text-gray-900">
                    {profile.locations && profile.locations.length > 0 ? (
                      <>
                        {profile.locations.slice(0, 3).map((loc, i) => (
                          <React.Fragment key={i}>
                            {loc}<br />
                          </React.Fragment>
                        ))}
                        {profile.locations.length > 3 && '...'}
                      </>
                    ) : (
                      'No locations specified'
                    )}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Work & Interpersonal Style</h5>
                
                {/* Show top slider from first 5 categories that have values */}
                {sliderCategories.slice(0, 5).map((category) => {
                  if (category.sliders.length === 0) return null;
                  
                  const slider = category.sliders[0];
                  const sliderValue = profile.sliderValues?.[slider.id] || 50;
                  
                  return (
                    <div key={slider.id} className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{slider.leftLabel}</span>
                        <span>{slider.rightLabel}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-primary rounded" 
                          style={{ width: `${sliderValue}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Full Profile Section */}
            <div>
              <h3 className="text-lg font-medium">Detailed Profile View</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                This is what employers see when they tap "View complete profile"
              </p>
              
              <div>
                <h3 className="text-md font-medium">Education</h3>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">Degree</p>
                    <p>{profile.education?.degree || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">Major</p>
                    <p>{profile.education?.major || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">School</p>
                    <p>{profile.education?.school || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium">Location Preferences</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {profile.locations && profile.locations.length > 0 ? (
                    profile.locations.map((location, index) => (
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
              
              <div className="mt-6">
                <h3 className="text-md font-medium">Work & Compatibility Profile</h3>
                <div className="mt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {sliderCategories.map((category, index) => (
                      <AccordionItem value={`item-${index}`} key={category.id}>
                        <AccordionTrigger className="font-medium">
                          {category.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {category.sliders.map(slider => {
                              const sliderValue = profile.sliderValues?.[slider.id] || 50;
                              
                              return (
                                <div key={slider.id} className="mb-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{slider.leftLabel}</span>
                                    <span>{slider.rightLabel}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded">
                                    <div 
                                      className="h-2 bg-primary rounded" 
                                      style={{ width: `${sliderValue}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline">Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}