import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import JobseekerLayout from '@/components/layouts/jobseeker-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, RefreshCw, ThumbsUp, ThumbsDown, Building2, 
  MapPin, Briefcase, ChevronDown, ChevronUp, Calendar, 
  DollarSign, GraduationCap, Clock, Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

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
  salary?: string;
  qualifications?: string;
  responsibilities?: string;
  benefits?: string;
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
    data: rawJobsData, 
    refetch: refetchAvailableJobs, 
    isLoading,
    isRefetching,
    error: jobsError
  } = useQuery<any>({
    queryKey: ['/api/jobseeker/jobs/available'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
    // Use the default queryFn from the client setup to benefit from all auth handling logic
    staleTime: 0, // Force refetch every time
    retry: 2 // Retry a few times to handle auth issues
  });
  
  // Process the raw jobs data to handle different response formats
  const availableJobs = React.useMemo(() => {
    if (!rawJobsData) return [];
    
    // Handle different response formats
    if (Array.isArray(rawJobsData)) {
      return rawJobsData;
    }
    
    // If the response includes _meta for mobile clients
    if (rawJobsData && typeof rawJobsData === 'object' && rawJobsData._meta) {
      // Extract the actual jobs array from the object keys (excluding _meta)
      const jobs = Object.keys(rawJobsData)
        .filter(key => key !== '_meta')
        .map(key => rawJobsData[key]);
      return jobs;
    }
    
    console.error('Unexpected jobs data format:', rawJobsData);
    return [];
  }, [rawJobsData]);
  
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
        ) : !availableJobs || !Array.isArray(availableJobs) || availableJobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No jobs available</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are currently no jobs available. Check back soon as new positions are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(availableJobs) && availableJobs.map((job: JobPosting) => {
              // Create more detailed job descriptions if needed
              const enhancedJob = {
                ...job,
                description: job.description || 'Join our team in this exciting role!',
                responsibilities: job.responsibilities || `
                  • Collaborate with cross-functional teams to design, develop, and implement innovative solutions
                  • Participate in the entire application lifecycle, from concept to technical design, coding, testing, and deployment
                  • Write clean, maintainable code while adhering to best practices and coding standards
                  • Troubleshoot and debug applications to optimize performance
                  • Stay current with emerging trends and technologies in the field
                `,
                qualifications: job.qualifications || `
                  • Bachelor's degree in Computer Science, Engineering, or related field
                  • Experience with relevant programming languages and technologies
                  • Strong problem-solving abilities and attention to detail
                  • Excellent communication and teamwork skills
                  • Ability to learn quickly and adapt to changing priorities
                `,
                benefits: job.benefits || `
                  • Competitive salary and comprehensive benefits package
                  • Flexible work arrangements and generous paid time off
                  • Professional development opportunities
                  • Collaborative and inclusive work environment
                  • Employee wellness programs
                `
              };
              
              return (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">{enhancedJob.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building2 className="h-4 w-4 mr-1" /> 
                          {enhancedJob.companyName}
                        </CardDescription>
                      </div>
                      {enhancedJob.logo && (
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={enhancedJob.logo} 
                            alt={`${enhancedJob.companyName} logo`} 
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
                        {enhancedJob.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Briefcase className="h-4 w-4 mr-1" /> 
                        {enhancedJob.employmentType}
                      </div>
                      {enhancedJob.department && (
                        <Badge variant="outline" className="text-xs">
                          {enhancedJob.department}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {enhancedJob.workType && enhancedJob.workType.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {enhancedJob.description}
                    </p>
                    
                    <div className="mt-3 flex justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center text-primary hover:text-primary">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]" aria-describedby={`job-details-${job.id}`}>
                          <DialogHeader>
                            <DialogTitle className="text-xl">{enhancedJob.title}</DialogTitle>
                            <DialogDescription id={`job-details-${job.id}`} className="flex flex-wrap gap-2 items-center mt-2">
                              <span className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" /> 
                                {enhancedJob.companyName}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" /> 
                                {enhancedJob.location}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" /> 
                                {enhancedJob.employmentType}
                              </span>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="mt-4 space-y-6">
                            <div>
                              <h4 className="font-medium text-lg mb-2">About This Role</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {enhancedJob.description}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-lg mb-2 flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Key Responsibilities
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {enhancedJob.responsibilities}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-lg mb-2 flex items-center">
                                <GraduationCap className="h-5 w-5 mr-2" />
                                Qualifications
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {enhancedJob.qualifications}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-lg mb-2 flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Benefits
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {enhancedJob.benefits}
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter className="mt-6 flex sm:justify-between gap-4">
                            <DialogClose asChild>
                              <Button variant="outline" size="sm">
                                Close
                              </Button>
                            </DialogClose>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotInterested(enhancedJob.id)}
                                disabled={showLoadingState}
                              >
                                <ThumbsDown className="h-4 w-4 mr-2" />
                                Not Interested
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInterested(enhancedJob.id)}
                                disabled={showLoadingState}
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Interested
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNotInterested(enhancedJob.id)}
                      disabled={showLoadingState}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Not Interested
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleInterested(enhancedJob.id)}
                      disabled={showLoadingState}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Interested
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
}