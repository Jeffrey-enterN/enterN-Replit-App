import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import JobseekerLayout from '@/components/layouts/jobseeker-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, ThumbsUp, ThumbsDown, Building2, MapPin, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  workType: string[];
  employmentType: string;
  department: string;
  companyId: number;
  logo?: string;
}

export default function JobsFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessingInterest, setIsProcessingInterest] = useState(false);

  // Redirect if not authenticated or if user is not a jobseeker
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.JOBSEEKER) {
      navigate('/employer/dashboard');
    }
  }, [user, navigate]);

  // Fetch available jobs
  const { 
    data: availableJobs, 
    refetch: refetchAvailableJobs, 
    isLoading,
    isRefetching,
    error: jobsError
  } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobseeker/jobs/available'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
    // Use the default queryFn from the client setup to benefit from all auth handling logic
    staleTime: 0, // Force refetch every time
    retry: 2 // Retry a few times to handle auth issues
  });
  
  // Handle errors for job loading
  React.useEffect(() => {
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      toast({
        title: 'Error fetching jobs',
        description: 'There was an issue loading jobs. Please try refreshing.',
        variant: 'destructive',
      });
    }
  }, [jobsError, toast]);

  // Handle job interest
  const jobInterestMutation = useMutation({
    mutationFn: async ({ jobId, interested }: { jobId: string; interested: boolean }) => {
      setIsProcessingInterest(true);
      const response = await apiRequest('POST', `/api/jobs/${jobId}/interest`, { interested });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/matches/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/jobs/available'] });
      
      toast({
        title: 'Success',
        description: 'Your interest has been recorded.',
      });
      
      setIsProcessingInterest(false);
    },
    onError: (error: Error) => {
      setIsProcessingInterest(false);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInterested = (jobId: string) => {
    jobInterestMutation.mutate({ jobId, interested: true });
  };

  const handleNotInterested = (jobId: string) => {
    jobInterestMutation.mutate({ jobId, interested: false });
  };
  
  // Determine if we should show the loading state
  const showLoadingState = isLoading || isRefetching || isProcessingInterest || 
    jobInterestMutation.isPending;
  
  return (
    <JobseekerLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Jobs Feed</h1>
          <Button 
            variant="outline"
            onClick={() => refetchAvailableJobs()}
            disabled={showLoadingState}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Jobs
          </Button>
        </div>
        
        {showLoadingState ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !availableJobs || availableJobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No jobs available</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are currently no jobs available. Check back soon as new positions are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {availableJobs.map((job: JobPosting) => (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="h-4 w-4 mr-1" /> 
                        {job.companyName}
                      </CardDescription>
                    </div>
                    {job.logo && (
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={job.logo} 
                          alt={`${job.companyName} logo`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" /> 
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-1" /> 
                      {job.employmentType}
                    </div>
                    {job.department && (
                      <Badge variant="outline" className="text-xs">
                        {job.department}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.workType && job.workType.map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {job.description}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotInterested(job.id)}
                    disabled={showLoadingState}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Not Interested
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleInterested(job.id)}
                    disabled={showLoadingState}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Interested
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
}