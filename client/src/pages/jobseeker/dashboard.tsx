import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import JobseekerLayout from '@/components/layouts/jobseeker-layout';
import OverviewStats from '@/components/dashboard/overview-stats';
import MatchCard from '@/components/dashboard/match-card';
import RecentMatches, { Match } from '@/components/dashboard/recent-matches';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, ExternalLink } from 'lucide-react';

// Interface for employer data in match card
interface EmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
}

// Interface for job posting data
interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  workType: string | string[];
  employmentType: string;
  department: string;
  companyId: number;
}

export default function JobseekerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or if user is not a jobseeker
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.JOBSEEKER) {
      navigate('/employer/dashboard');
    }
  }, [user, navigate]);

  // Interface for dashboard data
  interface DashboardData {
    stats: {
      profileCompletion?: { percentage: number };
      profileViews?: number;
      matches?: number;
    };
    recentMatches: Match[];
  }

  // Fetch dashboard data
  const { data: dashboardData = { stats: {}, recentMatches: [] } } = useQuery<DashboardData>({
    queryKey: ['/api/jobseeker/dashboard'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });

  // Fetch potential matches
  const { data: potentialMatches = [], refetch: refetchPotentialMatches } = useQuery<EmployerMatch[]>({
    queryKey: ['/api/jobseeker/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });
  
  // Fetch available jobs for jobs feed
  const { data: availableJobs = [], isLoading: isLoadingJobs } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobseeker/jobs/available'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
    select: (data) => {
      // Extract just the first few jobs for the dashboard preview
      return Array.isArray(data) ? data.slice(0, 3) : [];
    }
  });

  const currentEmployer = potentialMatches[0];

  // Handle interest/not interest
  const swipeMutation = useMutation({
    mutationFn: async ({ id, interested }: { id: string; interested: boolean }) => {
      const response = await apiRequest('POST', '/api/jobseeker/swipe', { employerId: id, interested });
      return response.json();
    },
    onSuccess: () => {
      refetchPotentialMatches();
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/matches/recent'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInterested = (id: string) => {
    swipeMutation.mutate({ id, interested: true });
  };

  const handleNotInterested = (id: string) => {
    swipeMutation.mutate({ id, interested: false });
  };

  // Use only real data from API
  const stats = dashboardData?.stats || {
    profileCompletion: { percentage: 0 },
    profileViews: 0,
    matches: 0
  };

  // Use only real matches data from API
  const recentMatches = dashboardData?.recentMatches || [];

  return (
    <JobseekerLayout>
      {/* Overview Stats */}
      <OverviewStats userType={USER_TYPES.JOBSEEKER} stats={stats} />

      {/* Match Feed */}
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden mb-8 border border-border transform transition-all hover:shadow-lg">
        <div className="px-4 py-5 border-b border-border sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-foreground">Match Feed</h3>
          <p className="mt-1 text-sm text-muted-foreground">Find your next opportunity by swiping on employers.</p>
        </div>
        <div className="px-4 py-6 sm:p-6">
          {currentEmployer ? (
            <MatchCard
              userType={USER_TYPES.JOBSEEKER}
              data={currentEmployer}
              onInterested={handleInterested}
              onNotInterested={handleNotInterested}
              isPending={swipeMutation.isPending}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No more potential matches right now. Check back later!
            </div>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <RecentMatches 
        matches={recentMatches} 
        emptyMessage="You haven't matched with any employers yet. Start swiping to find matches!"
        viewAllLink="/jobseeker/matches"
      />

      {/* Jobs Feed */}
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden mb-8 border border-border transform transition-all hover:shadow-lg">
        <div className="px-4 py-5 border-b border-border sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-foreground">Jobs Feed</h3>
            <p className="mt-1 text-sm text-muted-foreground">Discover job opportunities tailored to your skills and preferences.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/jobseeker/jobs-feed-optimized')}
            className="flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Jobs
          </Button>
        </div>
        <div className="px-4 py-6 sm:p-6">
          {isLoadingJobs ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading available jobs...</p>
            </div>
          ) : availableJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableJobs.map(job => {
                // Parse workType if it's a string
                let workTypeArray = [];
                try {
                  workTypeArray = typeof job.workType === 'string' 
                    ? JSON.parse(job.workType) 
                    : (Array.isArray(job.workType) ? job.workType : []);
                } catch (error) {
                  workTypeArray = Array.isArray(job.workType) ? job.workType : [];
                }
                
                return (
                  <div 
                    key={job.id} 
                    className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <h4 className="font-semibold text-md mb-1 truncate">{job.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Building2 className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{job.companyName}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-start text-sm text-muted-foreground mb-3">
                        <Briefcase className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {workTypeArray.map((type: string, index: number) => (
                            <span key={index} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate(`/jobseeker/jobs-feed-optimized?jobId=${job.id}`)}
                      >
                        View details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-foreground">No new jobs available</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You've reviewed all available jobs. Check back soon as new positions are added regularly.
              </p>
            </div>
          )}
        </div>
      </div>
    </JobseekerLayout>
  );
}
