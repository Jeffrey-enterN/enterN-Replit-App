import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
// import EmployerLayout from '@/components/layouts/employer-layout'; // Removed to prevent double navbar

// Job posting form schema
const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  zipCode: z.string().min(5, "Zip code is required").max(10, "Invalid zip code format"),
  isRemote: z.boolean().default(false),
  location: z.string().optional(),
  functionalArea: z.string().optional(),
  employmentType: z.enum([
    'Part-time internship', 
    'Full-time internship', 
    'Part-time perm role', 
    'Full-time perm role',
    'Contract'
  ]),
  workType: z.enum(['Remote', 'In-office', 'Hybrid']),
  description: z.string().min(50, "Job description must be at least 50 characters"),
  descriptionUrl: z.string().url().optional().or(z.literal('')),
  preferredMajors: z.array(z.string()).optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

export default function NewJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [cityState, setCityState] = useState('');
  const [newMajor, setNewMajor] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      zipCode: '',
      isRemote: false,
      location: '',
      functionalArea: '',
      employmentType: 'Full-time perm role',
      workType: 'In-office',
      description: '',
      descriptionUrl: '',
      preferredMajors: [],
    },
  });

  // Watch for zip code changes to update city/state
  const zipCode = form.watch('zipCode');
  const isRemote = form.watch('isRemote');
  const descriptionUrl = form.watch('descriptionUrl');

  // Fetch city/state from zip code
  useEffect(() => {
    if (zipCode && zipCode.length >= 5) {
      // In a real implementation, we would call a zip code API
      // For demo purposes, we'll simulate it
      const fetchCityState = async () => {
        try {
          // This would be a real API call in production
          // For demo, we'll use a timeout and hardcoded values
          setTimeout(() => {
            if (zipCode === '60601') {
              setCityState('Chicago, IL');
              form.setValue('location', 'Chicago, IL');
            } else if (zipCode === '10001') {
              setCityState('New York, NY');
              form.setValue('location', 'New York, NY');
            } else if (zipCode === '94103') {
              setCityState('San Francisco, CA');
              form.setValue('location', 'San Francisco, CA');
            } else {
              setCityState('Location not found');
              form.setValue('location', '');
            }
          }, 500);
        } catch (error) {
          console.error('Error fetching location:', error);
          setCityState('Error fetching location');
          form.setValue('location', '');
        }
      };

      fetchCityState();
    } else {
      setCityState('');
      form.setValue('location', '');
    }
  }, [zipCode, form]);

  // Handle job description URL scraping
  const scrapeJobDescription = async () => {
    if (!descriptionUrl) return;

    setIsScraping(true);
    try {
      // In a real implementation, this would call a backend API to scrape the job description
      // For demo purposes, we'll simulate it
      toast({
        title: 'Scraping Job Description',
        description: 'Fetching content from the provided URL...',
      });

      // Simulate API call delay
      setTimeout(() => {
        // Sample job description
        const scrapedDescription = `This is a simulated job description that would be scraped from ${descriptionUrl}. 
        
We are looking for a talented individual to join our team. The ideal candidate will have strong communication skills, experience in the field, and a passion for excellence.

Responsibilities:
- Work collaboratively with cross-functional teams
- Implement best practices and standards
- Create and maintain documentation

Requirements:
- Bachelor's degree in related field
- 2+ years of experience
- Strong problem-solving abilities`;

        form.setValue('description', scrapedDescription);
        setIsScraping(false);
        toast({
          title: 'Job Description Scraped',
          description: 'Successfully retrieved content from the URL',
        });
      }, 1500);

    } catch (error) {
      setIsScraping(false);
      toast({
        title: 'Error',
        description: 'Failed to scrape job description from the provided URL',
        variant: 'destructive',
      });
    }
  };

  const createJobMutation = useMutation({
    mutationFn: async (data: JobPostingFormValues) => {
      try {
        const response = await apiRequest('POST', '/api/employer/jobs', data);
        return response.json();
      } catch (error) {
        throw new Error('Failed to create job posting');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Job Created',
        description: 'Your job posting has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      navigate('/employer/jobs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: JobPostingFormValues) => {
    createJobMutation.mutate(data);
  };

  const addMajor = () => {
    if (newMajor.trim() === '') return;
    const currentMajors = form.getValues('preferredMajors') || [];
    form.setValue('preferredMajors', [...currentMajors, newMajor]);
    setNewMajor('');
  };

  const removeMajor = (index: number) => {
    const currentMajors = form.getValues('preferredMajors') || [];
    form.setValue('preferredMajors', currentMajors.filter((_, i) => i !== index));
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">
            Create a new job posting for your company
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Job Posting</CardTitle>
              <CardDescription>
                Enter all the details about the position you're offering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zip Code with City, State output */}
                <div>
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter zip code" 
                            {...field} 
                            disabled={isRemote}
                          />
                        </FormControl>
                        {cityState && !isRemote && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Location: {cityState}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Remote checkbox */}
                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue('location', 'Remote');
                              } else {
                                const zip = form.getValues('zipCode');
                                if (zip) {
                                  form.setValue('location', cityState || '');
                                } else {
                                  form.setValue('location', '');
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This position is fully remote</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Functional Area (formerly Department) */}
                <FormField
                  control={form.control}
                  name="functionalArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Functional Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Engineering, Marketing, Sales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Updated Employment Type options */}
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Part-time internship">Part-time internship</SelectItem>
                          <SelectItem value="Full-time internship">Full-time internship</SelectItem>
                          <SelectItem value="Part-time perm role">Part-time perm role</SelectItem>
                          <SelectItem value="Full-time perm role">Full-time perm role</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Type*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isRemote}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="In-office">In-office</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      {isRemote && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Work type set to Remote for remote positions
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Job Description with URL scraping option */}
              <div>
                <FormField
                  control={form.control}
                  name="descriptionUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description URL (Optional)</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/job-description" 
                            {...field} 
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          onClick={scrapeJobDescription}
                          disabled={!descriptionUrl || isScraping}
                        >
                          {isScraping ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <LinkIcon className="h-4 w-4 mr-2" />
                          )}
                          {isScraping ? 'Scraping...' : 'Scrape'}
                        </Button>
                      </div>
                      <FormDescription>
                        Enter a URL to scrape an existing job description, or manually enter it below
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Job Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the job description including responsibilities and requirements..." 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Preferred Majors (Optional)</FormLabel>
                <FormDescription className="mb-2">
                  Add academic backgrounds that would be a good fit for this role
                </FormDescription>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.getValues('preferredMajors')?.map((major, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {major}
                      <button 
                        type="button" 
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => removeMajor(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex">
                  <Input 
                    placeholder="e.g. Computer Science" 
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="mr-2"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addMajor}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employer/jobs')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createJobMutation.isPending}
              >
                {createJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Job Posting
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}