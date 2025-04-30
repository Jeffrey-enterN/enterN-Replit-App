import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DEGREE_LEVELS, WORK_ARRANGEMENTS, SLIDER_CATEGORIES, INDUSTRIES, LOCATIONS, FUNCTIONAL_ROLES } from '@/lib/constants';
import CollapsibleSliderSection from './collapsible-slider-section';
import { LocationInput } from '@/components/ui/location-input';
import { Check, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// Define the schema for step 1
const step1Schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  isStudent: z.boolean().optional(),
  schoolEmail: z.string().email({ message: 'Please enter a valid school email' }).optional().or(z.literal('')),
  school: z.string().optional().or(z.literal('')),
  degreeLevel: z.string().optional().or(z.literal('')),
  major: z.string().optional().or(z.literal('')),
});

// Define the schema for step 2
const step2Schema = z.object({
  portfolioUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  preferredLocations: z.array(z.string()).min(1, { message: 'Add at least one preferred location' }),
  workArrangements: z.array(z.string()).min(1, { message: 'Select at least one work arrangement' }),
  industryPreferences: z.array(z.string()).optional(),
  functionalPreferences: z.string().optional(),
});

// Combine schemas for the final form validation
const formSchema = step1Schema.merge(step2Schema);

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type FormValues = z.infer<typeof formSchema>;

export default function JobseekerProfileForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation } = useAuth();
  // For session expiration alert dialog
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  // Track the current step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  
  // State to persist form data between steps
  const [formData, setFormData] = useState<Partial<FormValues>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    isStudent: false,
    schoolEmail: '',
    school: '',
    degreeLevel: '',
    major: '',
    portfolioUrl: '',
    preferredLocations: [],
    workArrangements: [],
    industryPreferences: [],
    functionalPreferences: JSON.stringify([]), // Initialize as empty JSON array string
  });
  
  // Track slider section completion
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  
  // Query to fetch the user's profile if it exists
  const profileQuery = useQuery({
    queryKey: ['/api/jobseeker/profile'],
    queryFn: async () => {
      try {
        console.log('Fetching user profile, authenticated user:', !!user);
        const response = await apiRequest('GET', '/api/jobseeker/profile');
        console.log('Profile response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Successfully loaded profile data:', data);
          return data;
        }
        
        // If profile not found, it's ok, just return null
        if (response.status === 404) {
          console.log('No existing profile found, creating new profile form');
          return null;
        }
        
        // For authentication errors, throw so we can redirect
        if (response.status === 401) {
          throw new Error('Authentication error. Please login again.');
        }
        
        // For other errors, just log and return null
        console.error('Error loading profile:', response.status);
        return null;
      } catch (error) {
        console.error('Exception fetching profile:', error);
        // Show session expired dialog if auth error
        if (error instanceof Error && error.message.includes('Authentication error')) {
          setShowSessionAlert(true);
        }
        return null;
      }
    },
    enabled: !!user, // Only run if user is logged in
    retry: false, // Don't retry on error
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 1000 * 60 * 5 // Consider data fresh for 5 minutes
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(currentStep === 1 ? step1Schema : currentStep === 2 ? step2Schema : formSchema),
    defaultValues: formData,
    mode: 'onChange'
  });

  const updateSliderValue = (id: string, value: number) => {
    console.log(`Updating slider value for ${id} to ${value}`);
    setSliderValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Helper to check if a slider category is completed (only considering the first 5 sliders)
  const checkCategoryCompletion = (categoryId: string) => {
    const category = SLIDER_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return false;
    
    // Only check the first 5 sliders in each category
    const visibleSliders = category.sliders.slice(0, 5);
    return visibleSliders.every(slider => slider.id in sliderValues);
  };

  // Update section completion status
  const updateSectionCompletion = (categoryId: string) => {
    const isComplete = checkCategoryCompletion(categoryId);
    setCompletedSections(prev => ({
      ...prev,
      [categoryId]: isComplete
    }));
  };

  // Calculate completion percentage for all slider sections (only considering the first 5 sliders per category)
  const calculateSliderCompletionPercentage = () => {
    // Count only the first 5 sliders in each category
    const totalSliders = SLIDER_CATEGORIES.reduce((acc, cat) => acc + Math.min(5, cat.sliders.length), 0);
    
    // Count how many of the visible sliders have values
    const completedSliders = SLIDER_CATEGORIES.reduce((acc, cat) => {
      const visibleSliderIds = cat.sliders.slice(0, 5).map(s => s.id);
      const completedInCategory = visibleSliderIds.filter(id => id in sliderValues).length;
      return acc + completedInCategory;
    }, 0);
    
    return Math.round((completedSliders / totalSliders) * 100);
  };

  const createProfileMutation = useMutation({
    mutationFn: async (data: FormValues & { sliderValues: Record<string, number> }) => {
      const response = await apiRequest('POST', '/api/jobseeker/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile created',
        description: 'Your profile has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate('/jobseeker/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: FormValues & { sliderValues: Record<string, number> }) => {
      const response = await apiRequest('POST', '/api/jobseeker/profile/draft', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Draft saved',
        description: 'Your profile draft has been saved.',
      });
    },
    onError: (error: Error) => {
      // Check if this is an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Show session expired dialog
        setShowSessionAlert(true);
      } else {
        toast({
          title: 'Error saving draft',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Effect to load profile data when query completes
  useEffect(() => {
    console.log('Profile query data:', profileQuery.data);
    
    if (profileQuery.data) {
      const profile = profileQuery.data;
      console.log('Loading profile data:', profile);
      
      // Handle functional preferences conversion from various formats to JSON array string
      let formattedFunctionalPreferences = JSON.stringify([]);
      
      if (profile.functionalPreferences) {
        try {
          if (profile.functionalPreferences === '{}') {
            // Empty object case
            console.log('Converting empty object to empty array for functional preferences');
            formattedFunctionalPreferences = JSON.stringify([]);
          } else if (profile.functionalPreferences.startsWith('[')) {
            // Already a JSON array
            console.log('Functional preferences are already in JSON array format');
            // Parse and stringify to ensure proper format
            const parsed = JSON.parse(profile.functionalPreferences);
            formattedFunctionalPreferences = JSON.stringify(parsed);
          } else if (profile.functionalPreferences.includes(',')) {
            // Comma-separated string
            console.log('Converting comma-separated string to JSON array');
            const array = profile.functionalPreferences.split(',').map(item => item.trim()).filter(Boolean);
            formattedFunctionalPreferences = JSON.stringify(array);
          }
        } catch (e) {
          console.error('Error formatting functional preferences:', e);
          formattedFunctionalPreferences = JSON.stringify([]);
        }
      }
      
      console.log('Formatted functional preferences:', formattedFunctionalPreferences);
      
      // Update form data with profile values
      const profileData: Partial<FormValues> = {
        firstName: profile.firstName || user?.firstName || '',
        lastName: profile.lastName || user?.lastName || '',
        phone: profile.phone || '',
        isStudent: !!(profile.schoolEmail || profile.school || profile.degreeLevel || profile.major),
        schoolEmail: profile.schoolEmail || '',
        school: profile.school || '',
        degreeLevel: profile.degreeLevel || '',
        major: profile.major || '',
        portfolioUrl: profile.portfolioUrl || '',
        preferredLocations: Array.isArray(profile.preferredLocations) ? profile.preferredLocations : [],
        workArrangements: Array.isArray(profile.workArrangements) ? profile.workArrangements : [],
        industryPreferences: Array.isArray(profile.industryPreferences) ? profile.industryPreferences : [],
        functionalPreferences: formattedFunctionalPreferences,
      };
      
      console.log('Prepared profile data for form:', profileData);
      
      // Set form data
      setFormData(profileData);
      
      // Reset form with the new values
      form.reset(profileData);
      
      // Set slider values if they exist
      if (profile.sliderValues) {
        console.log('Setting slider values:', profile.sliderValues);
        setSliderValues(profile.sliderValues);
      }
    }
  }, [profileQuery.data, form, user]);

  // Effect to update form when data changes
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Only update with non-undefined values to avoid type errors
      const validValue: Partial<FormValues> = {};
      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
          // TypeScript requires this type assertion
          (validValue as any)[key] = val;
        }
      });
      
      setFormData(current => ({
        ...current,
        ...validValue
      }));
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate step 1 fields - only require first name, last name, and phone
      const isValid = await form.trigger([
        'firstName', 'lastName', 'phone'
      ]);
      
      // If student toggle is on, also validate education fields
      const isStudent = form.getValues('isStudent');
      if (isStudent) {
        const eduFieldsValid = await form.trigger([
          'schoolEmail', 'school', 'degreeLevel', 'major'
        ]);
        if (!eduFieldsValid) return;
      }
      
      if (isValid) {
        // Get current values
        const currentValues = form.getValues();
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          ...currentValues
        }));
        
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate step 2 fields
      const isValid = await form.trigger([
        'portfolioUrl', 'preferredLocations', 'workArrangements'
      ]);
      
      if (isValid) {
        // Get current values
        const currentValues = form.getValues();
        
        // Update form data 
        setFormData(prev => ({
          ...prev,
          ...currentValues
        }));
        
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // Get current values to persist them
      const currentValues = form.getValues();
      // Update form data
      setFormData(prev => ({
        ...prev,
        ...currentValues
      }));
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // First check authentication status
      const userResponse = await apiRequest('GET', '/api/user');
      if (!userResponse.ok) {
        console.error('Authentication check failed before profile submission');
        toast({
          title: 'Session expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        setShowSessionAlert(true);
        return;
      }
      
      console.log('Submitting complete profile with form data and slider values');
      console.log('Current slider values:', sliderValues);
      console.log('Number of slider values:', Object.keys(sliderValues).length);
      
      // Check if all categories have slider values
      SLIDER_CATEGORIES.forEach((category, index) => {
        const hasValues = category.sliders.slice(0, 5).some(slider => slider.id in sliderValues);
        console.log(`Category ${index + 1} (${category.title}): ${hasValues ? 'Has values' : 'No values'}`);
      });
      
      // We'll keep the data as-is since our functionalPreferences is already in JSON string format
      // from our checkbox handling, which is what the schema expects
      const preparedData = { ...data };
      
      // Proceed with profile creation
      createProfileMutation.mutate({ 
        ...preparedData, 
        sliderValues,
        // Add a timestamp for debugging
        ...(({ _submittedAt: new Date().toISOString() } as any))
      });
    } catch (error) {
      console.error('Error during profile submission:', error);
      toast({
        title: 'Submission Error',
        description: 'There was a problem saving your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSaveDraft = async () => {
    const data = form.getValues();
    
    // Add timestamp for tracking
    const saveTimestamp = new Date().toISOString();
    console.log(`Saving draft at ${saveTimestamp}`);
    
    try {
      // First, check if user is authenticated
      const userResponse = await apiRequest('GET', '/api/user');
      
      if (!userResponse.ok) {
        console.error('User not authenticated, redirecting to login');
        toast({
          title: 'Session expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        setShowSessionAlert(true);
        return;
      }
      
      // User is authenticated, proceed with saving
      console.log('User authenticated, saving draft with data:', {
        dataKeys: Object.keys(data),
        sliderKeys: Object.keys(sliderValues)
      });
      
      // Proceed with saving the draft
      saveDraftMutation.mutate({ 
        ...data, 
        sliderValues,
        // Type assertion to allow extra properties for debugging
        ...(({ _saveRequestedAt: saveTimestamp } as any))
      });
      
    } catch (error) {
      console.error('Error checking authentication before saving draft:', error);
      toast({
        title: 'Error saving draft',
        description: 'There was a problem saving your data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Progress indicators
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            {currentStep > 1 ? <Check className="h-5 w-5" /> : 1}
          </div>
          <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            {currentStep > 2 ? <Check className="h-5 w-5" /> : 2}
          </div>
          <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      {/* Session Expired Alert Dialog */}
      <AlertDialog open={showSessionAlert} onOpenChange={setShowSessionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired or you have been logged out. Please sign in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSessionAlert(false);
              navigate('/auth');
            }}>
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {renderStepIndicator()}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {/* Step 1: Essential Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Step 1: Essential Information</h2>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>First name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Last name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Phone number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="sm:col-span-6 border rounded-lg p-6 bg-gray-50 mt-4">
                    <h3 className="text-base font-medium text-gray-900 mb-2">Educational Information</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Providing your educational information helps us connect you with relevant job fairs, campus recruiting events, and other opportunities for early career professionals.
                    </p>

                    <FormField
                      control={form.control}
                      name="isStudent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Are you currently a student or recent graduate with an active .edu email address?</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('isStudent') && (
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-6 border-t pt-6">
                        <FormField
                          control={form.control}
                          name="schoolEmail"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-6">
                              <FormLabel>School email *</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be used to verify your school affiliation for campus events.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="school"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-6">
                              <FormLabel>School *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="degreeLevel"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Highest Level of Education Obtained (Or In Progress) *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a degree level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DEGREE_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="major"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <FormLabel>Major *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Portfolio and Preferences */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Step 2: Portfolio & Location Preferences</h2>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url"
                            {...field} 
                            placeholder="https://portfolio.example.com"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Add a link to your portfolio, personal website, or LinkedIn profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6 mt-6">
                  <FormField
                    control={form.control}
                    name="preferredLocations"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred Locations *</FormLabel>
                          <FormDescription>
                            Enter locations where you'd be interested in working (up to 10).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <LocationInput
                            value={field.value}
                            onChange={field.onChange}
                            maxLocations={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workArrangements"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Work Setting *</FormLabel>
                          <FormDescription>
                            Select all work settings you'd be open to.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {WORK_ARRANGEMENTS.map((arrangement) => (
                            <FormField
                              key={arrangement.id}
                              control={form.control}
                              name="workArrangements"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={arrangement.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(arrangement.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, arrangement.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== arrangement.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {arrangement.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industryPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Industry Preferences</FormLabel>
                          <FormDescription>
                            Select industries you're interested in working in.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {INDUSTRIES.map((industry) => (
                            <FormField
                              key={industry}
                              control={form.control}
                              name="industryPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={industry}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(industry)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], industry])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== industry
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {industry}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="functionalPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Functional Preferences</FormLabel>
                          <FormDescription>
                            Select functional roles you're interested in.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {FUNCTIONAL_ROLES.map((role) => (
                            <FormField
                              key={role.id}
                              control={form.control}
                              name="functionalPreferences"
                              render={({ field }) => {
                                // Parse the value which could be JSON string, comma-separated string, or array
                                let valueArray: string[] = [];
                                
                                if (Array.isArray(field.value)) {
                                  // Direct array (shouldn't normally happen based on schema)
                                  valueArray = field.value;
                                } else if (typeof field.value === 'string') {
                                  try {
                                    // First try to parse as JSON string (new format)
                                    if (field.value.startsWith('[')) {
                                      valueArray = JSON.parse(field.value);
                                    } else if (field.value === '{}' || field.value === '{' || field.value === '}') {
                                      // Empty object string from database
                                      valueArray = [];
                                      
                                      // Fix the value by setting it properly as an empty array
                                      field.onChange(JSON.stringify([]));
                                    } else if (field.value) {
                                      // Fallback to comma-separated string (legacy format)
                                      valueArray = field.value.split(',').map((item: string) => item.trim()).filter(Boolean);
                                      
                                      // Normalize this format to JSON array format
                                      field.onChange(JSON.stringify(valueArray));
                                    }
                                  } catch (e) {
                                    console.error('Error parsing functional preferences:', e);
                                    valueArray = [];
                                  }
                                }
                                
                                return (
                                  <FormItem
                                    key={role.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={valueArray.includes(role.id)}
                                        onCheckedChange={(checked) => {
                                          // Update the array of selected roles
                                          const newArray = checked
                                            ? [...valueArray, role.id]
                                            : valueArray.filter(v => v !== role.id);
                                          
                                          // Convert the array to a JSON string since the schema expects a string
                                          const newValue = JSON.stringify(newArray);
                                          
                                          console.log(`Setting functionalPreferences to: ${newValue}`);
                                          
                                          // Set the value as a string representation of the array
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {role.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Organization Fit Sliders */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-heading mb-4">
                  Step 3: Preference-Based Profile
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  These sliders help employers understand your preferences and work style, 
                  leading to better matches. Complete as many sections as possible for the 
                  most accurate matches.
                </p>
                
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Slider completion: {calculateSliderCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${calculateSliderCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                
                <CollapsibleSliderSection
                  categories={SLIDER_CATEGORIES}
                  values={sliderValues}
                  onChange={(id, value) => {
                    updateSliderValue(id, value);
                    // Find which category this slider belongs to
                    const category = SLIDER_CATEGORIES.find(cat => 
                      cat.sliders.some(slider => slider.id === id)
                    );
                    if (category) {
                      updateSectionCompletion(category.id);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-8">
            <div className="flex justify-between">
              {/* Back button shown on steps 2 and 3 */}
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back
                </Button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={saveDraftMutation.isPending}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {saveDraftMutation.isPending ? 'Saving...' : 'Save as Draft'}
                </Button>
                
                {/* Next button on steps 1 and 2 */}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Ensure we don't submit the form
                      handleNextStep(); 
                    }}
                    className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  // Submit button on step 3
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {createProfileMutation.isPending ? 'Submitting...' : 'Complete Profile'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
