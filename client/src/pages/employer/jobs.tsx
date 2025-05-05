import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import EmployerLayout from '@/components/layouts/employer-layout';

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

export default function JobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('all');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  
  // Fetch job postings
  const { data: jobPostings, isLoading: isJobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/employer/jobs', currentTab],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/employer/jobs');
        return response.json();
      } catch (error) {
        // Temporarily return mock data since the API endpoint isn't fully implemented
        return [];
      }
    },
    enabled: !!user,
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      try {
        await apiRequest('DELETE', `/api/employer/jobs/${jobId}`);
      } catch (error) {
        throw new Error('Failed to delete job posting');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Job Deleted',
        description: 'The job posting has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
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
      try {
        await apiRequest('PATCH', `/api/employer/jobs/${jobId}/status`, { status });
      } catch (error) {
        throw new Error('Failed to update job status');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'The job posting status has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

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

  // Handle job deletion confirmation
  const confirmDelete = (job: JobPosting) => {
    setJobToDelete(job);
    setIsAlertOpen(true);
  };

  // Execute job deletion
  const executeDelete = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete.id);
    }
    setIsAlertOpen(false);
    setJobToDelete(null);
  };

  // Filter jobs based on tab
  const filteredJobs = jobPostings || [];

  return (
    <EmployerLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Job Postings</h2>
            <p className="text-muted-foreground">
              Create and manage job postings for your company
            </p>
          </div>
          <Button>
            <Link href="/employer/jobs/new">
              <Plus className="mr-2 h-4 w-4" /> Create Job Posting
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {isJobsLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center p-8">
                <h3 className="font-medium text-lg mb-2">No job postings found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first job posting to find matching candidates.
                </p>
                <Button>
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
                          <div className="text-sm text-muted-foreground">{job.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{job.employmentType}</span>
                          <span className="text-xs text-muted-foreground">{job.workType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.matchCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/employer/jobs/${job.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Job
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => updateJobStatusMutation.mutate({ 
                                  jobId: job.id, 
                                  status: 'paused' 
                                })}
                              >
                                <span className="text-yellow-500 mr-2">⏸</span>
                                Pause Listing
                              </DropdownMenuItem>
                            ) : job.status === 'paused' ? (
                              <DropdownMenuItem 
                                onClick={() => updateJobStatusMutation.mutate({ 
                                  jobId: job.id, 
                                  status: 'active' 
                                })}
                              >
                                <span className="text-green-500 mr-2">▶️</span>
                                Activate Listing
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem 
                              onClick={() => updateJobStatusMutation.mutate({ 
                                jobId: job.id, 
                                status: 'closed' 
                              })}
                              className="text-destructive"
                            >
                              Close Listing
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => confirmDelete(job)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete this job posting and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EmployerLayout>
  );
}