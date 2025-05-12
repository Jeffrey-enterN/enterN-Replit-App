import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import JobseekerLayout from '@/components/layouts/jobseeker-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, Loader2, RefreshCw, ThumbsUp, ThumbsDown, Building2, 
  MapPin, Briefcase, ChevronDown, ChevronUp, Calendar, 
  DollarSign, GraduationCap, Clock, Users, X, Search, CheckCircle2, XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody, 
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from '@/components/ui/card';

interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  workType: string[] | string;
  employmentType: string;
  department: string;
  companyId: number;
  logo?: string;
  salary?: string;
  qualifications?: string;
  responsibilities?: string;
  benefits?: string;
  createdAt?: string;
}

export default function JobsFeedOptimized() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessingInterest, setIsProcessingInterest] = useState(false);
  const [currentErrorMessage, setCurrentErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('available');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof JobPosting | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'title',
    direction: 'asc',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
  const availableJobs = useMemo(() => {
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
  
  // Process interested jobs
  const interestedJobs = useMemo(() => {
    if (!interestedJobsData) return [];
    return interestedJobsData;
  }, [interestedJobsData]);
  
  // Process not interested jobs
  const notInterestedJobs = useMemo(() => {
    if (!notInterestedJobsData) return [];
    return notInterestedJobsData;
  }, [notInterestedJobsData]);
  
  // Handle errors for job loading
  useEffect(() => {
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
      
      // Clear selected job
      setSelectedJobId(null);
      
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
  
  // Sort the jobs based on the current sort configuration
  const sortJobs = (jobs: JobPosting[]) => {
    if (!sortConfig.key) return jobs;
    
    return [...jobs].sort((a, b) => {
      if (!a[sortConfig.key!] && !b[sortConfig.key!]) return 0;
      if (!a[sortConfig.key!]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (!b[sortConfig.key!]) return sortConfig.direction === 'asc' ? 1 : -1;
      
      const aValue = String(a[sortConfig.key!]).toLowerCase();
      const bValue = String(b[sortConfig.key!]).toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  // Get the currently active set of jobs based on the selected tab
  const getActiveJobs = () => {
    switch (selectedTab) {
      case 'available':
        return availableJobs || [];
      case 'interested':
        return interestedJobs || [];
      case 'not-interested':
        return notInterestedJobs || [];
      default:
        return availableJobs || [];
    }
  };
  
  // Filter jobs by search query
  const filteredJobs = useMemo(() => {
    const jobs = getActiveJobs();
    
    if (!searchQuery.trim()) {
      return sortJobs(jobs);
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return sortJobs(jobs.filter(job => 
      job.title.toLowerCase().includes(lowerCaseQuery) ||
      job.companyName.toLowerCase().includes(lowerCaseQuery) ||
      job.location.toLowerCase().includes(lowerCaseQuery) ||
      job.department?.toLowerCase().includes(lowerCaseQuery) ||
      job.employmentType?.toLowerCase().includes(lowerCaseQuery)
    ));
  }, [searchQuery, selectedTab, availableJobs, interestedJobs, notInterestedJobs, sortConfig]);
  
  // Handle sort request
  const requestSort = (key: keyof JobPosting) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Get the current page of jobs
  const currentJobs = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredJobs, currentPage, itemsPerPage]);
  
  // Get total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage)),
    [filteredJobs, itemsPerPage]
  );
  
  // Get pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Show a subset of pages
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          range.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        for (let i = totalPages - 4; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          range.push(i);
        }
      }
    }
    
    return range;
  };
  
  // Find the selected job
  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return [...availableJobs, ...interestedJobs, ...notInterestedJobs].find(job => job.id === selectedJobId);
  }, [selectedJobId, availableJobs, interestedJobs, notInterestedJobs]);
  
  // Determine if we should show the loading state
  const showLoadingState = isLoading || isRefetching || isLoadingInterestedJobs || 
    isLoadingNotInterestedJobs || isProcessingInterest || jobInterestMutation.isPending;
    
  // Format work type for display
  const formatWorkType = (workType: string | string[] | undefined): string[] => {
    if (!workType) return [];
    
    if (typeof workType === 'string') {
      try {
        return JSON.parse(workType);
      } catch (e) {
        return [workType];
      }
    } else if (Array.isArray(workType)) {
      return workType;
    }
    
    return [];
  };

  return (
    <JobseekerLayout>
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jobs Feed</h1>
            <p className="text-muted-foreground">
              Find and apply for jobs that match your interests.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              onClick={() => navigate('/jobseeker/jobs-feed')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Card View
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
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs by title, company, or location..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Tabs 
                    defaultValue="available" 
                    className="w-full md:w-auto"
                    value={selectedTab}
                    onValueChange={tab => {
                      setSelectedTab(tab);
                      setCurrentPage(1);
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="available">
                        Available ({availableJobs.length})
                      </TabsTrigger>
                      <TabsTrigger value="interested">
                        Interested ({interestedJobs.length})
                      </TabsTrigger>
                      <TabsTrigger value="not-interested">
                        Not Interested ({notInterestedJobs.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => requestSort('title')}
                    >
                      <div className="flex items-center">
                        Job Title
                        {sortConfig.key === 'title' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => requestSort('companyName')}
                    >
                      <div className="flex items-center">
                        Company
                        {sortConfig.key === 'companyName' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => requestSort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        {sortConfig.key === 'location' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="rounded-full bg-gray-100 p-3 mb-3">
                            <AlertCircle className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="font-medium text-lg text-gray-900">No jobs found</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedTab === 'available' ? (
                              "You've reviewed all available jobs."
                            ) : selectedTab === 'interested' ? (
                              "You haven't expressed interest in any jobs yet."
                            ) : (
                              "You haven't declined any jobs yet."
                            )}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                            {job.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {formatWorkType(job.workType).map((type, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              View Details
                            </Button>
                            
                            {selectedTab === 'available' && (
                              <>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleNotInterested(job.id)}
                                  disabled={jobInterestMutation.isPending}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="icon"
                                  onClick={() => handleInterested(job.id)}
                                  disabled={jobInterestMutation.isPending}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {selectedTab === 'interested' && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Interested
                              </Badge>
                            )}
                            
                            {selectedTab === 'not-interested' && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Declined
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredJobs.length > 0 && (
              <Pagination className="w-full justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {getPaginationRange().map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
        
        {/* Job Details Dialog */}
        {selectedJob && (
          <Dialog open={!!selectedJobId} onOpenChange={isOpen => !isOpen && setSelectedJobId(null)}>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" /> 
                    {selectedJob.companyName}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> 
                    {selectedJob.location}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="md:col-span-2">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-gray-700">
                    {selectedJob.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Employment:</span>
                      <span>{selectedJob.employmentType}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Department:</span>
                      <span>{selectedJob.department}</span>
                    </div>
                    {selectedJob.salary && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Salary:</span>
                        <span>{selectedJob.salary}</span>
                      </div>
                    )}
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground mr-2 block">Work Type:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formatWorkType(selectedJob.workType).map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(selectedJob.qualifications || selectedJob.responsibilities || selectedJob.benefits) && (
                  <div>
                    <h3 className="font-medium mb-2">Additional Information</h3>
                    <div className="space-y-2">
                      {selectedJob.qualifications && (
                        <div className="flex items-start text-sm">
                          <GraduationCap className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Qualifications:</span>
                            <p className="mt-1">{selectedJob.qualifications}</p>
                          </div>
                        </div>
                      )}
                      {selectedJob.responsibilities && (
                        <div className="flex items-start text-sm">
                          <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Responsibilities:</span>
                            <p className="mt-1">{selectedJob.responsibilities}</p>
                          </div>
                        </div>
                      )}
                      {selectedJob.benefits && (
                        <div className="flex items-start text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Benefits:</span>
                            <p className="mt-1">{selectedJob.benefits}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                {selectedTab === 'available' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleNotInterested(selectedJob.id)}
                      disabled={jobInterestMutation.isPending}
                      className="mr-2"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not Interested
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleInterested(selectedJob.id)}
                      disabled={jobInterestMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Interested
                    </Button>
                  </>
                )}
                
                {selectedTab === 'interested' && (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600 font-medium">You've expressed interest in this job</span>
                  </div>
                )}
                
                {selectedTab === 'not-interested' && (
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-red-600 font-medium">You've declined this job</span>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </JobseekerLayout>
  );
}