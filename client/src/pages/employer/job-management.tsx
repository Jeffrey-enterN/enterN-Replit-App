import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { canManageJobPosting, hasPermission } from '@/lib/permissions';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, Edit, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

// Job posting interface that matches the schema
interface JobPosting {
  id: string;
  title: string;
  employerId: number;
  employerName?: string; // For display purposes
  description: string;
  location: string;
  employmentType: string;
  workType: string;
  department?: string;
  requirements?: string[];
  responsibilities?: string[];
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt: string;
  matchCount?: number;
}

export default function JobManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('all');
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  
  // Fetch job postings based on the user's permissions
  const { data: jobPostings, isLoading: isJobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/employer/jobs', currentTab],
    queryFn: async () => {
      const endpoint = hasPermission(user, 'view_all_job_postings') && currentTab === 'all'
        ? '/api/employer/company/jobs'
        : '/api/employer/jobs';
      
      const response = await apiRequest('GET', endpoint);
      return response.json();
    },
    enabled: !!user,
  });

  // Delete job posting mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest('DELETE', `/api/employer/jobs/${jobId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Job Deleted',
        description: 'The job posting has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company/jobs'] });
      setJobToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/employer/jobs/${jobId}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'The job posting status has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company/jobs'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter jobs based on tab
  const filterJobs = () => {
    if (!jobPostings) return [];
    
    if (currentTab === 'my') {
      return jobPostings.filter(job => job.employerId === user?.id);
    }
    
    if (currentTab === 'active') {
      return jobPostings.filter(job => job.status === 'active');
    }
    
    if (currentTab === 'inactive') {
      return jobPostings.filter(job => job.status !== 'active');
    }
    
    return jobPostings;
  };

  const filteredJobs = filterJobs();

  // Format job status as badge
  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (status === 'paused') {
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Paused</Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-500">Closed</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Job Management"
      subtitle="Create and manage job postings for your company"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <p className="text-muted-foreground">
            {hasPermission(user, 'view_all_job_postings')
              ? 'Manage all job postings from your company'
              : 'Manage your job postings'}
          </p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">
            <Plus className="mr-2 h-4 w-4" /> Create Job Posting
          </Link>
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          {hasPermission(user, 'view_all_job_postings') && (
            <TabsTrigger value="my">My Jobs</TabsTrigger>
          )}
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isJobsLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">No job postings found</p>
              <Button asChild variant="outline">
                <Link href="/employer/jobs/new">
                  <Plus className="mr-2 h-4 w-4" /> Create your first job posting
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  {hasPermission(user, 'view_all_job_postings') && (
                    <TableHead>Posted By</TableHead>
                  )}
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{job.title}</div>
                        {job.department && (
                          <div className="text-sm text-muted-foreground">{job.department}</div>
                        )}
                      </div>
                    </TableCell>
                    {hasPermission(user, 'view_all_job_postings') && (
                      <TableCell>
                        {job.employerName || (job.employerId === user?.id ? 'You' : 'Unknown')}
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <div>{job.location}</div>
                        <div className="text-sm text-muted-foreground">{job.workType}</div>
                      </div>
                    </TableCell>
                    <TableCell>{job.employmentType}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        {job.matchCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageJobPosting(user, job.employerId) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/employer/jobs/${job.id}/matches`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Matches
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/employer/jobs/${job.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Job
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => updateJobStatusMutation.mutate({
                                  jobId: job.id,
                                  status: 'paused',
                                })}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Pause Listing
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateJobStatusMutation.mutate({
                                  jobId: job.id,
                                  status: 'active',
                                })}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Activate Listing
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setJobToDelete(job)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/employer/jobs/${job.id}`}>
                            View
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Job Confirmation Dialog */}
      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => jobToDelete && deleteJobMutation.mutate(jobToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteJobMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}