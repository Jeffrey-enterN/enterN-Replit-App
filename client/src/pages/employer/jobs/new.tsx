import { useState } from 'react';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import EmployerLayout from '@/components/layouts/employer-layout';

// Job posting form schema
const jobPostingSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  department: z.string().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  workType: z.enum(['Remote', 'In-office', 'Hybrid']),
  description: z.string().min(50, "Job description must be at least 50 characters"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is needed"),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

export default function NewJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      location: '',
      department: '',
      employmentType: 'Full-time',
      workType: 'In-office',
      description: '',
      requirements: [],
      responsibilities: [],
    },
  });

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

  const addRequirement = () => {
    if (newRequirement.trim() === '') return;
    const currentRequirements = form.getValues('requirements') || [];
    form.setValue('requirements', [...currentRequirements, newRequirement]);
    setNewRequirement('');
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues('requirements') || [];
    form.setValue('requirements', currentRequirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim() === '') return;
    const currentResponsibilities = form.getValues('responsibilities') || [];
    form.setValue('responsibilities', [...currentResponsibilities, newResponsibility]);
    setNewResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    const currentResponsibilities = form.getValues('responsibilities') || [];
    form.setValue('responsibilities', currentResponsibilities.filter((_, i) => i !== index));
  };

  return (
    <EmployerLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Create New Job Posting</h1>
            <p className="text-muted-foreground">
              Fill out the details to create a new job posting for your company
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Basic information about the position
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
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the role, company culture, and what makes this position exciting"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={() => (
                      <FormItem>
                        <FormLabel>Requirements*</FormLabel>
                        <div className="flex space-x-2 mb-2">
                          <Input 
                            placeholder="e.g. 3+ years of experience with React"
                            value={newRequirement}
                            onChange={(e) => setNewRequirement(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addRequirement();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={addRequirement}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {form.watch('requirements')?.map((requirement, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted rounded p-2">
                              <span>{requirement}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRequirement(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={() => (
                      <FormItem>
                        <FormLabel>Responsibilities*</FormLabel>
                        <div className="flex space-x-2 mb-2">
                          <Input 
                            placeholder="e.g. Develop new features for our flagship product"
                            value={newResponsibility}
                            onChange={(e) => setNewResponsibility(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addResponsibility();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={addResponsibility}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {form.watch('responsibilities')?.map((responsibility, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted rounded p-2">
                              <span>{responsibility}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeResponsibility(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
    </EmployerLayout>
  );
}