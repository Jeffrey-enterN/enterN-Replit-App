import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { hasPermission, canManageJobPosting } from '@/lib/permissions';
import DashboardLayout from '@/components/layouts/dashboard-layout';
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
import { WORK_ARRANGEMENTS } from '@/lib/constants';

// Job posting form schema
const jobFormSchema = z.object({
  title: z.string().min(3, 'Job title is required'),
  description: z.string().min(50, 'Please provide a detailed job description (minimum 50 characters)'),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  workType: z.string().min(1, 'Work type is required'),
  department: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  status: z.string().default('active'),
  // For admins only - if they want to create a posting on behalf of someone else
  assignedEmployerId: z.number().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  isEditMode?: boolean;
  jobId?: string;
}

export default function JobForm({ isEditMode = false, jobId }: JobFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  
  // Fetch the job data for edit mode
  const { data: jobData, isLoading: isJobLoading } = useQuery({
    queryKey: [`/api/employer/jobs/${jobId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/employer/jobs/${jobId}`);
      return response.json();
    },
    enabled: isEditMode && !!jobId,
  });

  // Fetch company team members if user is an admin
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery({
    queryKey: ['/api/employer/company/team'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/employer/company/team');
      return response.json();
    },
    enabled: hasPermission(user, 'manage_all_job_postings'),
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      employmentType: 'full-time',
      workType: 'onsite',
      department: '',
      requirements: [],
      responsibilities: [],
      status: 'active',
    },
  });

  // Update form when job data loads in edit mode
  useEffect(() => {
    if (isEditMode && jobData) {
      // Check if user has permission to edit this job
      if (!canManageJobPosting(user, jobData.employerId)) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to edit this job posting.',
          variant: 'destructive',
        });
        navigate('/employer/jobs');
        return;
      }

      form.reset({
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        employmentType: jobData.employmentType,
        workType: jobData.workType,
        department: jobData.department || '',
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        status: jobData.status,
        assignedEmployerId: jobData.employerId !== user?.id ? jobData.employerId : undefined,
      });
    }
  }, [isEditMode, jobData, user, form, navigate, toast]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const response = await apiRequest('POST', '/api/employer/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Job Created',
        description: 'Your job posting has been successfully created.',
      });
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

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const response = await apiRequest('PUT', `/api/employer/jobs/${jobId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Job Updated',
        description: 'The job posting has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employer/jobs/${jobId}`] });
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

  const onSubmit = (data: JobFormValues) => {
    if (isEditMode) {
      updateJobMutation.mutate(data);
    } else {
      createJobMutation.mutate(data);
    }
  };

  // Helper functions for requirements and responsibilities
  const addRequirement = () => {
    if (!newRequirement.trim()) return;
    
    const requirements = form.getValues().requirements || [];
    form.setValue('requirements', [...requirements, newRequirement.trim()]);
    setNewRequirement('');
  };

  const removeRequirement = (index: number) => {
    const requirements = form.getValues().requirements || [];
    form.setValue('requirements', requirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (!newResponsibility.trim()) return;
    
    const responsibilities = form.getValues().responsibilities || [];
    form.setValue('responsibilities', [...responsibilities, newResponsibility.trim()]);
    setNewResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    const responsibilities = form.getValues().responsibilities || [];
    form.setValue('responsibilities', responsibilities.filter((_, i) => i !== index));
  };

  if (isEditMode && isJobLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const isPending = createJobMutation.isPending || updateJobMutation.isPending;
  const requirements = form.watch('requirements') || [];
  const responsibilities = form.watch('responsibilities') || [];

  return (
    <DashboardLayout
      title={isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}
      subtitle={isEditMode ? 'Update job details and requirements' : 'Add a new job posting to your company'}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide the basic information about this position
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
                      <Input 
                        placeholder="e.g. Software Engineer, Marketing Manager" 
                        {...field} 
                      />
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
                        <Input 
                          placeholder="e.g. New York, NY or Remote" 
                          {...field} 
                        />
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
                        <Input 
                          placeholder="e.g. Engineering, Marketing" 
                          {...field} 
                        />
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORK_ARRANGEMENTS.map((arrangement) => (
                            <SelectItem key={arrangement} value={arrangement.toLowerCase()}>
                              {arrangement}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Admin-only field: Assign job to another team member */}
              {hasPermission(user, 'manage_all_job_postings') && (
                <FormField
                  control={form.control}
                  name="assignedEmployerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Team Member</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to yourself (default)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={user?.id?.toString() || ''}>
                            Yourself (default)
                          </SelectItem>
                          {teamMembers?.team
                            ?.filter((member: any) => member.id !== user?.id)
                            .map((member: any) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.firstName} {member.lastName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        As an admin, you can create job postings on behalf of your team members
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only active job postings will be visible to candidates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the role, including key responsibilities, qualifications, and what success looks like..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements & Responsibilities</CardTitle>
              <CardDescription>
                Add specific requirements and responsibilities for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel>Requirements</FormLabel>
                <FormDescription>
                  List specific qualifications, skills, or experience required for this role
                </FormDescription>
                
                <div className="flex space-x-2 mb-4 mt-2">
                  <Input
                    placeholder="Add a requirement"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type="button" onClick={addRequirement}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                <div className="space-y-2 my-4">
                  {requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No requirements added yet</p>
                  ) : (
                    requirements.map((req, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted p-3 rounded-md">
                        <span>{req}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <FormLabel>Responsibilities</FormLabel>
                <FormDescription>
                  List the key tasks and responsibilities for this position
                </FormDescription>
                
                <div className="flex space-x-2 mb-4 mt-2">
                  <Input
                    placeholder="Add a responsibility"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
                  />
                  <Button type="button" onClick={addResponsibility}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                
                <div className="space-y-2 my-4">
                  {responsibilities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No responsibilities added yet</p>
                  ) : (
                    responsibilities.map((resp, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted p-3 rounded-md">
                        <span>{resp}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResponsibility(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
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
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Job Posting' : 'Create Job Posting'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </DashboardLayout>
  );
}