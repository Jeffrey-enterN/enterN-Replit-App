import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { COMPANY_SIZES, INDUSTRIES, COMPANY_BENEFITS } from '@/lib/constants';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  companyWebsite: z.string().url({ message: 'Please enter a valid URL' }),
  headquarters: z.string().min(1, { message: 'Headquarters location is required' }),
  yearFounded: z.coerce.number()
    .int()
    .min(1800, { message: 'Year founded must be 1800 or later' })
    .max(currentYear, { message: `Year founded must be ${currentYear} or earlier` }),
  companySize: z.string().min(1, { message: 'Company size is required' }),
  companyIndustry: z.string().min(1, { message: 'Industry is required' }),
  aboutCompany: z.string().min(20, { message: 'Please provide at least 20 characters about your company' }),
  additionalOffices: z.array(z.string()),
  companyMission: z.string().min(1, { message: 'Company mission is required' }),
  companyValues: z.string().min(1, { message: 'Company values are required' }),
  benefits: z.array(z.string()),
  additionalBenefits: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmployerProfileForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [offices, setOffices] = useState<string[]>(['']);
  
  // Query to fetch the employer's profile if it exists
  const profileQuery = useQuery({
    queryKey: ['/api/employer/profile'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/employer/profile');
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      companyWebsite: '',
      headquarters: '',
      yearFounded: currentYear,
      companySize: '',
      companyIndustry: '',
      aboutCompany: '',
      additionalOffices: [''],
      companyMission: '',
      companyValues: '',
      benefits: [],
      additionalBenefits: '',
    },
  });

  const addOffice = () => {
    setOffices([...offices, '']);
    form.setValue('additionalOffices', [...form.getValues('additionalOffices'), '']);
  };

  const removeOffice = (index: number) => {
    const newOffices = [...offices];
    newOffices.splice(index, 1);
    setOffices(newOffices);
    
    const currentOffices = form.getValues('additionalOffices');
    currentOffices.splice(index, 1);
    form.setValue('additionalOffices', currentOffices);
  };

  const handleOfficeChange = (index: number, value: string) => {
    const currentOffices = form.getValues('additionalOffices');
    currentOffices[index] = value;
    form.setValue('additionalOffices', currentOffices);
  };
  
  // Effect to load profile data when query completes
  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data;
      
      // Reset form with the profile data
      form.reset({
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        headquarters: profile.headquarters || '',
        yearFounded: profile.yearFounded || currentYear,
        companySize: profile.companySize || '',
        companyIndustry: profile.companyIndustry || '',
        aboutCompany: profile.aboutCompany || '',
        additionalOffices: profile.additionalOffices?.length ? profile.additionalOffices : [''],
        companyMission: profile.companyMission || '',
        companyValues: profile.companyValues || '',
        benefits: profile.benefits || [],
        additionalBenefits: profile.additionalBenefits || '',
      });
      
      // Update offices state
      if (profile.additionalOffices?.length) {
        setOffices(profile.additionalOffices);
      }
    }
  }, [profileQuery.data, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/employer/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile created',
        description: 'Your company profile has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate('/employer/dashboard');
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
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/employer/profile/draft', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Draft saved',
        description: 'Your company profile draft has been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving draft',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Filter out empty office locations
    data.additionalOffices = data.additionalOffices.filter(office => office.trim() !== '');
    createProfileMutation.mutate(data);
  };

  const onSaveDraft = () => {
    const data = form.getValues();
    saveDraftMutation.mutate(data);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {/* Company Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Company Information</h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Company name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Company website</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headquarters"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Headquarters location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearFounded"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Year founded</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1800}
                          max={currentYear}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Number of employees</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                <FormField
                  control={form.control}
                  name="companyIndustry"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
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
                  name="aboutCompany"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>About the company</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="Brief description of your company, vision, and what makes you unique."
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of your company, vision, and what makes you unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Offices Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Additional Offices</h2>
              <div id="additional-offices" className="space-y-4">
                {offices.map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-grow">
                      <Input
                        name={`office-${index}`}
                        placeholder="Office location"
                        value={form.getValues('additionalOffices')[index] || ''}
                        onChange={(e) => handleOfficeChange(index, e.target.value)}
                      />
                    </div>
                    {index === 0 ? (
                      <Button
                        type="button"
                        onClick={addOffice}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => removeOffice(index)}
                        variant="destructive"
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">Add all locations where you have offices or hiring opportunities.</p>
            </div>

            {/* Mission & Values Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Mission & Values</h2>
              <div>
                <FormField
                  control={form.control}
                  name="companyMission"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Company mission</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="Describe your company's mission and purpose."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyValues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Core values</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="List your company's core values that guide your organization."
                        />
                      </FormControl>
                      <FormDescription>
                        List your company's core values that guide your organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Perks & Benefits Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Perks & Benefits</h2>
              <FormField
                control={form.control}
                name="benefits"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 mb-6">
                      {COMPANY_BENEFITS.map((benefit) => (
                        <FormField
                          key={benefit.id}
                          control={form.control}
                          name="benefits"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={benefit.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(benefit.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, benefit.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== benefit.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {benefit.label}
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
                name="additionalBenefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional perks & benefits</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={3}
                        placeholder="List any other unique perks or benefits your company offers."
                      />
                    </FormControl>
                    <FormDescription>
                      List any other unique perks or benefits your company offers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-8">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={saveDraftMutation.isPending}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {saveDraftMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="submit"
                disabled={createProfileMutation.isPending}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {createProfileMutation.isPending ? 'Submitting...' : 'Complete Profile'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
