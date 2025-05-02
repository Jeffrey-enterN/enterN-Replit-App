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
  yearFounded: z.string().refine(
    (val) => !val || (/^\\d{4}$/.test(val) && parseInt(val) <= new Date().getFullYear()), 
    { message: FORM_VALIDATION.invalidYear }
  ),
  careersUrl: z.string().url(FORM_VALIDATION.invalidUrl).optional().or(z.literal('')),
  
  // Step 2: About the Company
  industries: z.array(z.string()).min(1, "Select at least one industry"),
  functionalAreas: z.array(z.string()).min(1, "Select at least one functional area"),
  about: z.string().min(1, FORM_VALIDATION.required),
  mission: z.string().min(1, FORM_VALIDATION.required),
  vision: z.string().optional(),
  values: z.array(z.string()).optional(),
  
  // Step 3: Work Environment & Benefits
  workArrangements: z.array(z.string()).min(1, "Select at least one work arrangement"),
  compensationLevel: z.string().optional(), // Made optional since we're removing the field
  benefits: z.array(z.string()).optional(),
  culture: z.string().min(1, FORM_VALIDATION.required),
  
  // Step 4: Development Programs
  hasInterns: z.boolean().default(false),
  internDuration: z.string().optional(),
  internDescription: z.string().optional(),
  internLeadsToFulltime: z.boolean().default(false),
  
  hasApprentices: z.boolean().default(false),
  apprenticeDuration: z.string().optional(),
  apprenticeDescription: z.string().optional(),
  
  hasDevelopmentPrograms: z.boolean().default(false),
  developmentProgramDuration: z.string().optional(),
  developmentProgramDescription: z.string().optional(),
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
      const res = await apiRequest('POST', '/api/companies', formData);
      
      if (!res.ok) {
        throw new Error('Failed to create company profile');
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
      // Match job types with our work arrangements
      const matchedArrangements = WORK_ARRANGEMENTS.filter(arrangement => 
        scrapedData.jobTypes?.some(type => 
          arrangement.toLowerCase().includes(type.toLowerCase())
        )
      );
      
      if (matchedArrangements.length > 0) {
        formValues.workArrangements = matchedArrangements;
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
      
      // Set current step from draft if available
      if (draftData.step) {
        setCurrentStep(draftData.step);
      }
    }
  }, [draftData, isDraftLoading, form]);
  
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
        fieldsToValidate = ['industries', 'functionalAreas', 'about', 'mission'];
        break;
      case 3:
        fieldsToValidate = ['workArrangements', 'culture'];
        break;
      case 4:
        fieldsToValidate = [];
        // No specific validation for step 4
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
      setIsLoading(true);
      await createCompanyMutation.mutateAsync(values);
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
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
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
          
          <FormField
            control={form.control}
            name="yearFounded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Founded (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter year founded (e.g., 2010)" 
                    {...field} 
                    maxLength={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="careersUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Careers Website URL (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input 
                      placeholder="https://careers.yourcompany.com" 
                      {...field} 
                      value={field.value || websiteUrl}
                      onChange={(e) => {
                        field.onChange(e);
                        setWebsiteUrl(e.target.value);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScraper(true)}
                      disabled={!websiteUrl}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Add your careers page URL to automatically import company data
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Website Scraper Dialog */}
        <AlertDialog open={showScraper} onOpenChange={setShowScraper}>
          <AlertDialogContent className="max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Import Company Information</AlertDialogTitle>
              <AlertDialogDescription>
                We'll scan your website to help you fill in your company profile. This will save you time and ensure your profile is accurate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <div className="flex items-center space-x-2 mb-4">
                <Input 
                  placeholder="https://careers.yourcompany.com" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Button
                  onClick={() => scrapeWebsiteMutation.mutate(websiteUrl)}
                  disabled={!websiteUrl || isScraping}
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Scan Website
                    </>
                  )}
                </Button>
              </div>
              
              {isScraping && (
                <Alert className="mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Scanning your website</AlertTitle>
                  <AlertDescription>
                    Please wait while we analyze your company website. This may take a moment...
                  </AlertDescription>
                </Alert>
              )}
              
              {scrapedData && (
                <div className="space-y-4">
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Website scanned successfully!</AlertTitle>
                    <AlertDescription className="text-green-600">
                      We found some information about your company. Review below and click "Use Data" to apply it to your profile.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                    {scrapedData.about && (
                      <div>
                        <h4 className="font-semibold text-sm">About</h4>
                        <p className="text-sm text-gray-600 truncate">{scrapedData.about.substring(0, 100)}...</p>
                      </div>
                    )}
                    
                    {scrapedData.mission && (
                      <div>
                        <h4 className="font-semibold text-sm">Mission</h4>
                        <p className="text-sm text-gray-600 truncate">{scrapedData.mission.substring(0, 100)}...</p>
                      </div>
                    )}
                    
                    {scrapedData.culture && (
                      <div>
                        <h4 className="font-semibold text-sm">Culture</h4>
                        <p className="text-sm text-gray-600 truncate">{scrapedData.culture.substring(0, 100)}...</p>
                      </div>
                    )}
                    
                    {scrapedData.values && (
                      <div>
                        <h4 className="font-semibold text-sm">Values</h4>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(scrapedData.values) ? scrapedData.values : [scrapedData.values]).map((value, i) => (
                            <Badge key={i} variant="outline">{value}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {scrapedData.industryKeywords && scrapedData.industryKeywords.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Industries</h4>
                        <div className="flex flex-wrap gap-1">
                          {scrapedData.industryKeywords.map((industry, i) => (
                            <Badge key={i} variant="outline">{industry}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {scrapedData.jobTypes && scrapedData.jobTypes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Work Arrangements</h4>
                        <div className="flex flex-wrap gap-1">
                          {scrapedData.jobTypes.map((type, i) => (
                            <Badge key={i} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {scrapedData && (
                <AlertDialogAction onClick={applyScrapedData}>
                  Use This Data
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };
  
  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="industries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industries*</FormLabel>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {INDUSTRIES.map((industry) => (
                  <div key={industry} className="inline-flex">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={field.value?.includes(industry)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), industry]);
                        } else {
                          field.onChange(field.value?.filter((i) => i !== industry));
                        }
                      }}
                    />
                    <label
                      htmlFor={`industry-${industry}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {industry}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Select all industries that apply to your company
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="functionalAreas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Functional Areas*</FormLabel>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {FUNCTIONAL_AREAS.map((area) => (
                  <div key={area} className="inline-flex">
                    <Checkbox
                      id={`area-${area}`}
                      checked={field.value?.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), area]);
                        } else {
                          field.onChange(field.value?.filter((a) => a !== area));
                        }
                      }}
                    />
                    <label
                      htmlFor={`area-${area}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {area}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Select all functional areas where your company hires
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About the Company*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your company..." 
                  className="min-h-24"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a brief overview of what your company does
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="mission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Mission*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your company's mission?" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="vision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Vision (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your company's vision for the future?" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };
  
  const renderStep3 = () => {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="workArrangements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Arrangements*</FormLabel>
              <div className="flex flex-wrap gap-2">
                {WORK_ARRANGEMENTS.map((arrangement) => (
                  <div key={arrangement} className="inline-flex items-center mr-4 mb-2">
                    <Checkbox
                      id={`arrangement-${arrangement}`}
                      checked={field.value?.includes(arrangement)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, arrangement]);
                        } else {
                          field.onChange(currentValue.filter((a) => a !== arrangement));
                        }
                      }}
                    />
                    <label
                      htmlFor={`arrangement-${arrangement}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {arrangement}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Select all work arrangements your company offers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefits Offered (Optional)</FormLabel>
              <div className="flex flex-wrap gap-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                {COMPANY_BENEFITS.map((benefit) => (
                  <div key={benefit} className="inline-flex items-center mr-4 mb-2">
                    <Checkbox
                      id={`benefit-${benefit}`}
                      checked={field.value?.includes(benefit)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, benefit]);
                        } else {
                          field.onChange(currentValue.filter((b) => b !== benefit));
                        }
                      }}
                    />
                    <label
                      htmlFor={`benefit-${benefit}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {benefit}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription>
                Select all benefits your company offers to employees
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="culture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Culture*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your company's culture and values..." 
                  className="min-h-24"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                What makes your company a unique place to work?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };
  
  const renderStep4 = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Internship Program</h3>
          
          <div className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="hasInterns"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Does your company offer internships?
                    </FormLabel>
                    <FormDescription>
                      Check this if you offer internship opportunities
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          {form.watch('hasInterns') && (
            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="internDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internship Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROGRAM_DURATIONS.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
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
                  name="internLeadsToFulltime"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Can lead to full-time employment
                        </FormLabel>
                        <FormDescription>
                          Check if internships can convert to full-time roles
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="internDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internship Program Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your internship program..." 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Apprenticeship Program</h3>
          
          <div className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="hasApprentices"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Does your company offer apprenticeships?
                    </FormLabel>
                    <FormDescription>
                      Check this if you offer apprenticeship opportunities
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          {form.watch('hasApprentices') && (
            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
              <FormField
                control={form.control}
                name="apprenticeDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apprenticeship Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROGRAM_DURATIONS.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
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
                name="apprenticeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apprenticeship Program Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your apprenticeship program..." 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Early Career Development Program</h3>
          
          <div className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="hasDevelopmentPrograms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Does your company offer early career development programs?
                    </FormLabel>
                    <FormDescription>
                      Check this if you offer rotational programs, traineeships, or other structured development programs
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          {form.watch('hasDevelopmentPrograms') && (
            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
              <FormField
                control={form.control}
                name="developmentProgramDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROGRAM_DURATIONS.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
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
                name="developmentProgramDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Development Program Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your early career development program..." 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{COMPANY_PROFILE_STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {COMPANY_PROFILE_STEPS[currentStep - 1].description}
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
                    <span className="text-xs mt-1">{step.title}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${((currentStep - 1) / (COMPANY_PROFILE_STEPS.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {renderStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading || saveDraftMutation.isPending}
                className="mr-2"
              >
                {saveDraftMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
              
              {currentStep < COMPANY_PROFILE_STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isLoading || createCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Company Profile'
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}