import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DEGREE_LEVELS, LOCATIONS, WORK_ARRANGEMENTS, SLIDER_CATEGORIES } from '@/lib/constants';
import SliderSection from './slider-section';

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

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  schoolEmail: z.string().email({ message: 'Please enter a valid school email' }).optional().or(z.literal('')),
  school: z.string().min(1, { message: 'School is required' }),
  degreeLevel: z.string().min(1, { message: 'Degree level is required' }),
  major: z.string().min(1, { message: 'Major is required' }),
  preferredLocations: z.array(z.string()).min(1, { message: 'Select at least one preferred location' }),
  workArrangements: z.array(z.string()).min(1, { message: 'Select at least one work arrangement' }),
  summary: z.string().optional(),
  // Slider values will be handled separately
});

type FormValues = z.infer<typeof formSchema>;

export default function JobseekerProfileForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      schoolEmail: '',
      school: '',
      degreeLevel: '',
      major: '',
      preferredLocations: [],
      workArrangements: [],
      summary: '',
    },
  });

  const updateSliderValue = (id: string, value: number) => {
    setSliderValues(prev => ({
      ...prev,
      [id]: value
    }));
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
      toast({
        title: 'Error saving draft',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createProfileMutation.mutate({ ...data, sliderValues });
  };

  const onSaveDraft = () => {
    const data = form.getValues();
    saveDraftMutation.mutate({ ...data, sliderValues });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {/* Essential Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Essential Information</h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>First name</FormLabel>
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
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolEmail"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>School email (if different)</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        This email will be used to verify your school affiliation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>School</FormLabel>
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
                      <FormLabel>Level of degree</FormLabel>
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
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Major</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Write a brief summary about yourself, your skills, and career goals"
                          className="h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Your Preferences</h2>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="preferredLocations"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Preferred Locations</FormLabel>
                        <FormDescription>
                          Select all locations where you'd be interested in working.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {LOCATIONS.map((location) => (
                          <FormField
                            key={location}
                            control={form.control}
                            name="preferredLocations"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={location}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(location)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, location])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== location
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {location}
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
                  name="workArrangements"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Preferred Work Arrangements</FormLabel>
                        <FormDescription>
                          Select all work arrangements you'd be open to.
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
              </div>
            </div>

            {/* Organization Fit Sliders */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-heading mb-6">Organizational Fit</h2>
              <p className="text-sm text-gray-600 mb-6">
                These sliders help employers understand your preferences and work style, leading to better matches.
              </p>
              
              <div className="space-y-8">
                {SLIDER_CATEGORIES.map((category) => (
                  <SliderSection
                    key={category.id}
                    title={category.title}
                    sliders={category.sliders}
                    values={sliderValues}
                    onChange={updateSliderValue}
                  />
                ))}
              </div>
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
