import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useLocation, useRoute } from 'wouter';
import debounce from 'lodash/debounce';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, UploadCloud, CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';

// Constants
import {
  COMPANY_PROFILE_STEPS,
  INDUSTRIES,
  FUNCTIONAL_AREAS,
  WORK_ARRANGEMENTS,
  COMPANY_SIZES,
  COMPANY_BENEFITS,
  COMPENSATION_LEVELS,
  PROGRAM_DURATIONS,
  FORM_VALIDATION
} from '@/lib/constants';

// Create Schema
const companyProfileSchema = z.object({
  // Step 1: Company Basics
  name: z.string().min(1, FORM_VALIDATION.required),
  adminName: z.string().min(1, FORM_VALIDATION.required),
  adminEmail: z.string().email(FORM_VALIDATION.invalidEmail),
  adminPhone: z.string().optional(),
  headquarters: z.string().min(1, FORM_VALIDATION.required),
  size: z.string().min(1, FORM_VALIDATION.required),
  yearFounded: z.string().optional()
    .refine(
      (val) => !val || (/^\d{4}$/.test(val) && parseInt(val) <= new Date().getFullYear()), 
      { message: FORM_VALIDATION.invalidYear }
    ),
  careersUrl: z.string().optional()
    .refine(
      (val) => !val || val === '' || val.startsWith('http'),
      { message: FORM_VALIDATION.invalidUrl }
    ),
  
  // Step 2: About the Company
  industries: z.array(z.string()).optional(), // Made optional
  functionalAreas: z.array(z.string()).optional(), // Made optional
  about: z.string().min(1, FORM_VALIDATION.required),
  mission: z.string().optional(), // Made optional
  vision: z.string().optional(),
  values: z.array(z.string()).optional(),
  
  // Step 3: Work Environment & Development Programs (Combined)
  workArrangements: z.array(z.string()).min(1, "Select at least one work arrangement"),
  benefits: z.array(z.string()).optional(),
  culture: z.string().optional(), // Made optional since we've removed it
  
  // Development Programs
  hasDevelopmentPrograms: z.boolean().default(false),
  developmentProgramDuration: z.string().optional(),
  developmentProgramDescription: z.string().optional(),
  
  // Legacy fields that are still in the schema
  hasInterns: z.boolean().default(false),
  internDuration: z.string().optional(),
  internDescription: z.string().optional(),
  internLeadsToFulltime: z.boolean().default(false),
  
  hasApprentices: z.boolean().default(false),
  apprenticeDuration: z.string().optional(),
  apprenticeDescription: z.string().optional(),
  
  compensationLevel: z.string().optional() // Made optional since we're removing the field
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

// Define scraper response type
interface ScrapedCompanyData {
  about?: string;
  mission?: string;
  vision?: string;
  values?: string | string[];
  culture?: string;
  benefits?: string | string[];
  industryKeywords?: string[];
  locations?: string[];
  jobTypes?: string[];
  success?: boolean;
  error?: string;
}

// Company Profile Form Component
export function CompanyProfileForm({ companyId }: { companyId?: number }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Current step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showScraper, setShowScraper] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedCompanyData | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  
  // Form setup with zod validation
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      headquarters: '',
      size: '',
      yearFounded: '',
      careersUrl: '',
      
      industries: [],
      functionalAreas: [],
      about: '',
      mission: '',
      vision: '',
      values: [],
      
      workArrangements: [],
      compensationLevel: '',
      benefits: [],
      culture: '',
      
      hasInterns: false,
      internDuration: '',
      internDescription: '',
      internLeadsToFulltime: false,
      
      hasApprentices: false,
      apprenticeDuration: '',
      apprenticeDescription: '',
      
      hasDevelopmentPrograms: false,
      developmentProgramDuration: '',
      developmentProgramDescription: '',
    }
  });
  
  // Get draft data if available
  const { data: draftData, isLoading: isDraftLoading } = useQuery({
    queryKey: ['/api/employer/company-profile/draft', companyId],
    queryFn: async () => {
      // Always include the user ID (from auth) in the query to ensure we get the right draft
      const res = await apiRequest(
        'GET', 
        `/api/employer/company-profile/draft${companyId ? `?companyId=${companyId}` : ''}`
      );
      if (!res.ok) {
        console.error('Failed to load draft:', res.status, res.statusText);
        if (res.status === 404) {
          return null;
        }
        throw new Error('Failed to load company profile draft');
      }
      return await res.json();
    },
    enabled: !!user,
    retry: false,
    staleTime: 0 // Always fetch fresh data
  });
  
  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (payload: {
      draftData: CompanyProfileFormValues;
      companyId?: number;
      step: number;
    }) => {
      const res = await apiRequest('POST', '/api/employer/company-profile/draft', payload);
      
      if (!res.ok) {
        throw new Error('Failed to save company profile draft');
      }
      
      return await res.json();
    }
  });
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (formData: CompanyProfileFormValues) => {
      console.log('Making API request to /api/company with form data:', formData);
      const res = await apiRequest('POST', '/api/company', formData);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API error response:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to create company profile');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Company profile created',
        description: 'Your company profile has been created successfully.',
      });
      // Redirect to dashboard
      setLocation('/employer/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Creation failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Scrape website mutation
  const scrapeWebsiteMutation = useMutation({
    mutationFn: async (url: string) => {
      setIsScraping(true);
      const res = await apiRequest('POST', '/api/employer/scrape-website', { url });
      
      if (!res.ok) {
        throw new Error('Failed to scrape website. Please check the URL and try again.');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setScrapedData(data);
      setIsScraping(false);
      toast({
        title: 'Website scraped successfully',
        description: 'We found some information about your company. You can now review and use it.',
      });
    },
    onError: (error) => {
      setIsScraping(false);
      toast({
        title: 'Website scraping failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Apply scraped data to form
  const applyScrapedData = () => {
    if (!scrapedData) return;
    
    const formValues: Partial<CompanyProfileFormValues> = {};
    
    if (scrapedData.about) {
      formValues.about = scrapedData.about;
    }
    
    if (scrapedData.mission) {
      formValues.mission = scrapedData.mission;
    }
    
    if (scrapedData.vision) {
      formValues.vision = scrapedData.vision;
    }
    
    if (scrapedData.values) {
      if (Array.isArray(scrapedData.values)) {
        formValues.values = scrapedData.values;
      } else if (typeof scrapedData.values === 'string') {
        // Convert string to array by splitting on newlines or commas
        formValues.values = scrapedData.values
          .split(/[,\\n]/)
          .map(v => v.trim())
          .filter(v => v.length > 0);
      }
    }
    
    if (scrapedData.culture) {
      formValues.culture = scrapedData.culture;
    }
    
    if (scrapedData.benefits) {
      if (Array.isArray(scrapedData.benefits)) {
        // Try to match scraped benefits with our predefined list
        formValues.benefits = scrapedData.benefits
          .map(benefit => {
            const matchedBenefit = COMPANY_BENEFITS.find(b => 
              benefit.toLowerCase().includes(b.toLowerCase())
            );
            return matchedBenefit || benefit;
          });
      }
    }
    
    if (scrapedData.industryKeywords && scrapedData.industryKeywords.length > 0) {
      // Match industry keywords with our predefined list
      const matchedIndustries = INDUSTRIES.filter(industry => 
        scrapedData.industryKeywords?.some(keyword => 
          industry.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      if (matchedIndustries.length > 0) {
        formValues.industries = matchedIndustries;
      }
    }
    
    if (scrapedData.jobTypes && scrapedData.jobTypes.length > 0) {
      try {
        // Match job types with our work arrangements
        const matchedArrangements = WORK_ARRANGEMENTS.filter(arrangement => 
          scrapedData.jobTypes?.some(type => 
            arrangement.label.toLowerCase().includes(type.toLowerCase())
          )
        );
        
        if (matchedArrangements.length > 0) {
          formValues.workArrangements = matchedArrangements.map(arr => arr.id);
        }
      } catch (error) {
        console.error('Error matching job types to work arrangements:', error);
      }
    }
    
    // Update form with scraped data
    form.reset({ ...form.getValues(), ...formValues });
    
    // Close the scraper dialog
    setShowScraper(false);
  };
  
  // Load draft data into form
  useEffect(() => {
    if (draftData?.draftData && !isDraftLoading) {
      form.reset(draftData.draftData);
      
      // Set current step from draft if available, but ONLY on initial load
      // This prevents the step from being reset when saving progress during navigation
      if (draftData.step && currentStep === 1) {
        // If the saved step is greater than our available steps (e.g., after reducing from 4 to 3 steps),
        // set it to the maximum valid step
        const safeStep = Math.min(draftData.step, COMPANY_PROFILE_STEPS.length);
        setCurrentStep(safeStep);
        console.log('Loaded step from draft:', safeStep);
      }
    }
  }, [draftData, isDraftLoading, form, currentStep]);
  
  // Save draft function (can be called manually or automatically)
  const saveDraft = async (silent: boolean = false) => {
    try {
      const formData = form.getValues();
      const result = await saveDraftMutation.mutateAsync({
        draftData: formData,
        companyId,
        step: currentStep,
      });
      
      if (!silent) {
        queryClient.invalidateQueries({ queryKey: ['/api/employer/company-profile/draft', companyId] });
        toast({
          title: 'Progress saved',
          description: 'Your company profile progress has been saved.',
        });
      }
      return result;
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Save failed',
          description: error.message,
          variant: 'destructive',
        });
      }
      console.error('Failed to save draft:', error);
      throw error;
    }
  };
  
  // Wrapper for the onClick handler to handle the event properly
  const handleSaveDraft = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    saveDraft(false);
  };

  // Set up debounced auto-save
  const debouncedSave = useCallback(
    debounce(() => {
      if (form.formState.isDirty) {
        saveDraft(true); // silent=true to avoid toast notifications on auto-save
      }
    }, 3000), // 3 seconds delay before auto-saving
    [form.formState.isDirty, form]
  );

  // Watch for form changes and trigger auto-save
  useEffect(() => {
    const subscription = form.watch(() => {
      debouncedSave();
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
      // @ts-ignore - Lodash debounce has cancel method
      debouncedSave.cancel();
    };
  }, [form, debouncedSave]);
  
  // Validate current step and move to next
  const handleNextStep = async () => {
    let fieldsToValidate: string[] = [];
    
    // Define which fields to validate based on current step
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'adminName', 'adminEmail', 'headquarters', 'size'];
        break;
      case 2:
        fieldsToValidate = ['about']; // Only validate about field, industries, functionalAreas and mission are now optional
        break;
      case 3:
        fieldsToValidate = ['workArrangements'];
        // No longer require culture field
        break;
    }
    
    // Validate specified fields
    const result = await form.trigger(fieldsToValidate as any);
    
    if (!result) {
      toast({
        title: 'Validation failed',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    
    // First increment the step
    const nextStep = currentStep + 1;
    if (nextStep <= COMPANY_PROFILE_STEPS.length) {
      // Then update the state
      setCurrentStep(nextStep);
      
      // Save the draft with the new step number
      try {
        const formData = form.getValues();
        await saveDraftMutation.mutateAsync({
          draftData: formData,
          companyId,
          step: nextStep, // Using the new step number
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/employer/company-profile/draft', companyId] });
        
        toast({
          title: 'Moving to next step',
          description: `Step ${nextStep} of ${COMPANY_PROFILE_STEPS.length}`,
        });
      } catch (error: any) {
        console.error('Failed to save draft during next step:', error);
        toast({
          title: 'Error saving progress',
          description: error.message || 'An error occurred while saving your progress.',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Move to previous step
  const handlePrevStep = async () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Save the draft with the previous step number
      try {
        const formData = form.getValues();
        await saveDraftMutation.mutateAsync({
          draftData: formData,
          companyId,
          step: prevStep,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/employer/company-profile/draft', companyId] });
      } catch (error: any) {
        console.error('Failed to save draft during previous step:', error);
      }
    }
  };
  
  // Final submission
  const onSubmit = async (values: CompanyProfileFormValues) => {
    try {
      console.log('Form submission started with values:', values);
      setIsLoading(true);
      await createCompanyMutation.mutateAsync(values);
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render different form steps based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderCombinedStep3();
      default:
        return null;
    }
  };
  
  // Combined Step 3 function that includes both environment and development programs
  const renderCombinedStep3 = () => {
    return (
      <div className="space-y-8">
        {/* Work Environment Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Work Environment</h3>
            
            <FormField
              control={form.control}
              name="workArrangements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Arrangements*</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {WORK_ARRANGEMENTS.map((arrangement) => (
                      <div key={arrangement.id} className="inline-flex items-center mr-4 mb-2">
                        <Checkbox
                          id={`arrangement-${arrangement.id}`}
                          checked={Array.isArray(field.value) && field.value.includes(arrangement.id)}
                          onCheckedChange={(checked) => {
                            const currentValue = Array.isArray(field.value) ? field.value : [];
                            if (checked) {
                              field.onChange([...currentValue, arrangement.id]);
                            } else {
                              field.onChange(currentValue.filter(
                                (value: string) => value !== arrangement.id
                              ));
                            }
                          }}
                          className="rounded-sm"
                        />
                        <label
                          htmlFor={`arrangement-${arrangement.id}`}
                          className="ml-2 text-sm font-medium leading-none cursor-pointer"
                        >
                          {arrangement.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits & Perks</FormLabel>
                  <div className="h-64 overflow-y-auto border rounded-md p-2">
                    <div className="space-y-1">
                      {COMPANY_BENEFITS.map((benefit) => (
                        <div key={benefit} className="flex items-center">
                          <Checkbox
                            id={`benefit-${benefit}`}
                            checked={Array.isArray(field.value) && field.value.includes(benefit)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...currentValue, benefit]);
                              } else {
                                field.onChange(currentValue.filter(
                                  (value: string) => value !== benefit
                                ));
                              }
                            }}
                            className="rounded-sm"
                          />
                          <label
                            htmlFor={`benefit-${benefit}`}
                            className="ml-2 text-sm font-medium leading-none cursor-pointer"
                          >
                            {benefit}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormDescription>
                    Select the benefits and perks your company offers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
      </div>
    );
  };
  
  const renderStep1 = () => {
    return (
      <>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Contact Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter admin contact name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The main point of contact for this company account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email*</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter admin email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="adminPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter admin phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="headquarters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headquarters Location*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter headquarters location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="yearFounded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Founded (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter year founded (e.g., 2010)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid 4-digit year (e.g., 2010)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="careersUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Careers Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://careers.example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL must start with http:// or https://
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </>
    );
  };
  
  const renderStep2 = () => {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowScraper(true)}
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Import Data</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Import Company Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter your company's website URL to automatically extract information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="flex flex-col gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="website-url" className="col-span-1 text-right font-medium text-sm">
                      Website URL
                    </label>
                    <div className="col-span-3 flex gap-2">
                      <Input
                        id="website-url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  {scrapedData && !scrapedData.error && (
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Data Found</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <ul className="list-disc space-y-1 pl-5">
                              {scrapedData.about && <li>About Information</li>}
                              {scrapedData.mission && <li>Mission Statement</li>}
                              {scrapedData.vision && <li>Vision</li>}
                              {scrapedData.values && <li>Values</li>}
                              {scrapedData.culture && <li>Company Culture</li>}
                              {scrapedData.benefits && <li>Benefits & Perks</li>}
                              {scrapedData.industryKeywords && scrapedData.industryKeywords.length > 0 && <li>Industry Keywords</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {scrapedData?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{scrapedData.error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setShowScraper(false);
                    setScrapedData(null);
                    setWebsiteUrl('');
                  }}>
                    Cancel
                  </AlertDialogCancel>
                  
                  {!scrapedData || scrapedData.error ? (
                    <Button 
                      type="button"
                      onClick={() => scrapeWebsiteMutation.mutate(websiteUrl)}
                      disabled={!websiteUrl || isScraping}
                    >
                      {isScraping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isScraping ? 'Processing...' : 'Scrape Website'}
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={applyScrapedData}
                    >
                      Apply Data
                    </Button>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* Industries and Functional Areas sections removed */}
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About the Company*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide a detailed description of your company..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Describe what your company does, its products/services, and target market.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is your company's mission..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your company's core purpose and focus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vision (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is your company's vision for the future..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your company's aspirations and what it wants to achieve.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
          console.log('Form submit event triggered');
          form.handleSubmit((values) => {
            console.log('Form handleSubmit callback triggered');
            onSubmit(values);
          })(e);
        }} 
        className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep > 0 && currentStep <= COMPANY_PROFILE_STEPS.length 
                ? COMPANY_PROFILE_STEPS[currentStep - 1].title 
                : 'Company Profile'}
            </CardTitle>
            <CardDescription>
              {currentStep > 0 && currentStep <= COMPANY_PROFILE_STEPS.length 
                ? COMPANY_PROFILE_STEPS[currentStep - 1].description
                : 'Fill out your company profile information'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {COMPANY_PROFILE_STEPS.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}
                  >
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep > step.id 
                          ? 'bg-primary text-white border-primary' 
                          : currentStep === step.id 
                            ? 'border-primary text-primary' 
                            : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-xs mt-1 text-center">{step.shortTitle}</span>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  style={{ width: `${(currentStep / COMPANY_PROFILE_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Form content based on current step */}
            {renderStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Draft
              </Button>
              
              {currentStep < COMPANY_PROFILE_STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isLoading || createCompanyMutation.isPending}
                  onClick={() => {
                    console.log('Submit button clicked');
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {(isLoading || createCompanyMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Company
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}