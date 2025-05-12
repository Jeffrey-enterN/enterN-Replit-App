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
  AlertCircle, Loader2, RefreshCw, ThumbsUp, ThumbsDown, Building2, 
  MapPin, Briefcase, ChevronDown, ChevronUp, Calendar, 
  DollarSign, GraduationCap, Clock, Users, X
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
  const [currentErrorMessage, setCurrentErrorMessage] = useState<string | null>(null);

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
    staleTime: 0, // Force refetch every time
    retry: 2 // Retry a few times to handle auth issues
  });
  
  // Fetch interested jobs
  const {
    data: interestedJobsData,
    isLoading: isLoadingInterestedJobs,
    refetch: refetchInterestedJobs
  } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobseeker/jobs/interested'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });
  
  // Fetch not interested jobs
  const {
    data: notInterestedJobsData,
    isLoading: isLoadingNotInterestedJobs,
    refetch: refetchNotInterestedJobs
  } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobseeker/jobs/not-interested'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
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

  // Define the type for the job interest mutation variables
  interface JobInterestMutationVariables {
    jobId: string; 
    interested: boolean;
  }

  // Handle job interest
  const jobInterestMutation = useMutation<any, Error, JobInterestMutationVariables>({
    mutationFn: async ({ jobId, interested }) => {
      // Clear any previous error messages
      setCurrentErrorMessage(null);
      setIsProcessingInterest(true);
      
      try {
        const response = await apiRequest('POST', `/api/jobseeker/jobs/${jobId}/interest`, { interested });
        const data = await response.json();
        return data;
      } catch (error) {
        // Check if it's a duplicate key error
        if (error instanceof Error && error.message.includes('duplicate key value')) {
          // Extract the job ID from the error message if possible
          setCurrentErrorMessage("You've already expressed interest in this job");
          throw new Error("You've already expressed interest in this job");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries to refresh all job lists
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/matches/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/jobs/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/jobs/interested'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/jobs/not-interested'] });
      
      // Refetch the job lists
      refetchAvailableJobs();
      refetchInterestedJobs();
      refetchNotInterestedJobs();
      
      toast({
        title: 'Success',
        description: data.message || 'Your interest has been recorded.',
      });
      
      setIsProcessingInterest(false);
    },
    onError: (error: Error) => {
      setIsProcessingInterest(false);
      
      // Create a more user-friendly error message
      const errorMessage = error.message.includes('duplicate key value') 
        ? "You've already expressed interest in this job"
        : error.message;
      
      // Set the current error for display in the UI
      setCurrentErrorMessage(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
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
  
  // Process interested jobs
  const interestedJobs = React.useMemo(() => {
    if (!interestedJobsData) return [];
    return interestedJobsData;
  }, [interestedJobsData]);
  
  // Process not interested jobs
  const notInterestedJobs = React.useMemo(() => {
    if (!notInterestedJobsData) return [];
    return notInterestedJobsData;
  }, [notInterestedJobsData]);
  
  // Determine if we should show the loading state
  const showLoadingState = isLoading || isRefetching || isLoadingInterestedJobs || 
    isLoadingNotInterestedJobs || isProcessingInterest || jobInterestMutation.isPending;

  return (
    <JobseekerLayout>
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Jobs Feed</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/jobseeker/jobs-feed-optimized')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 18h18M3 6h18" />
              </svg>
              Table View
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                refetchAvailableJobs();
                refetchInterestedJobs();
                refetchNotInterestedJobs();
              }}
              disabled={showLoadingState}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {showLoadingState ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Available Jobs Section */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
              {(!availableJobs || !Array.isArray(availableJobs) || availableJobs.length === 0) ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">No new jobs available</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    You've reviewed all available jobs. Check back soon as new positions are added regularly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {Array.isArray(availableJobs) && availableJobs.map((job: JobPosting) => {
                    // Parse workType if it's a string
                    let workType = [];
                    try {
                      workType = typeof job.workType === 'string'
                        ? JSON.parse(job.workType as string)
                        : (Array.isArray(job.workType) ? job.workType : []);
                    } catch (error) {
                      workType = Array.isArray(job.workType) ? job.workType : [];
                    }
                      
                    const enhancedJob = {
                      ...job,
                      workType: workType
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
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {enhancedJob.workType && Array.isArray(enhancedJob.workType) && enhancedJob.workType.map((type: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="text-xl">{enhancedJob.title}</DialogTitle>
                                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                                  <span className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.companyName}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.location}
                                  </span>
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="mt-4">
                                <p className="text-sm text-gray-700">
                                  {enhancedJob.description}
                                </p>
                              </div>
                              
                              <DialogFooter className="mt-4">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNotInterested(enhancedJob.id)}
                                  disabled={jobInterestMutation.isPending}
                                  className="mr-2"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Not Interested
                                </Button>
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleInterested(enhancedJob.id)}
                                  disabled={jobInterestMutation.isPending}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Interested
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                        
                        <CardFooter className="flex gap-2 pt-0">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleNotInterested(enhancedJob.id)}
                            disabled={jobInterestMutation.isPending}
                            className="flex-1"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Not Interested
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleInterested(enhancedJob.id)}
                            disabled={jobInterestMutation.isPending}
                            className="flex-1"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Interested
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Interested Jobs Section */}
            {interestedJobs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ThumbsUp className="mr-2 h-5 w-5 text-emerald-500" />
                  Jobs You're Interested In
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {interestedJobs.map((job: JobPosting) => {
                    // Parse workType if it's a string
                    let workType = [];
                    try {
                      workType = typeof job.workType === 'string'
                        ? JSON.parse(job.workType as string)
                        : (Array.isArray(job.workType) ? job.workType : []);
                    } catch (error) {
                      workType = Array.isArray(job.workType) ? job.workType : [];
                    }
                      
                    const enhancedJob = {
                      ...job,
                      workType: workType
                    };
                    
                    return (
                      <Card key={job.id} className="overflow-hidden border-l-4 border-l-emerald-500">
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
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {enhancedJob.workType && Array.isArray(enhancedJob.workType) && enhancedJob.workType.map((type: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="text-xl">{enhancedJob.title}</DialogTitle>
                                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                                  <span className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.companyName}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.location}
                                  </span>
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="mt-4">
                                <p className="text-sm text-gray-700">
                                  {enhancedJob.description}
                                </p>
                              </div>
                              
                              <DialogFooter className="mt-4">
                                <Badge variant="outline" className="mr-auto">
                                  <ThumbsUp className="h-4 w-4 mr-1 text-emerald-500" />
                                  You expressed interest in this job
                                </Badge>
                                
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNotInterested(enhancedJob.id)}
                                  disabled={jobInterestMutation.isPending}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Change to Not Interested
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Not Interested Jobs Section */}
            {notInterestedJobs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ThumbsDown className="mr-2 h-5 w-5 text-gray-500" />
                  Jobs You're Not Interested In
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {notInterestedJobs.map((job: JobPosting) => {
                    // Parse workType if it's a string
                    let workType = [];
                    try {
                      workType = typeof job.workType === 'string'
                        ? JSON.parse(job.workType as string)
                        : (Array.isArray(job.workType) ? job.workType : []);
                    } catch (error) {
                      workType = Array.isArray(job.workType) ? job.workType : [];
                    }
                      
                    const enhancedJob = {
                      ...job,
                      workType: workType
                    };
                    
                    return (
                      <Card key={job.id} className="overflow-hidden border-l-4 border-l-gray-300 opacity-75 hover:opacity-100 transition-opacity">
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
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {enhancedJob.workType && Array.isArray(enhancedJob.workType) && enhancedJob.workType.map((type: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="text-xl">{enhancedJob.title}</DialogTitle>
                                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                                  <span className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.companyName}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" /> 
                                    {enhancedJob.location}
                                  </span>
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="mt-4">
                                <p className="text-sm text-gray-700">
                                  {enhancedJob.description}
                                </p>
                              </div>
                              
                              <DialogFooter className="mt-4">
                                <Badge variant="outline" className="mr-auto text-gray-600">
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  You expressed no interest in this job
                                </Badge>
                                
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInterested(enhancedJob.id)}
                                  disabled={jobInterestMutation.isPending}
                                  className="ml-auto"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Change to Interested
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </JobseekerLayout>
  );
}