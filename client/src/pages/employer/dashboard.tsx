import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import OverviewStats from '@/components/dashboard/overview-stats';
import MatchCard from '@/components/dashboard/match-card';
import RecentMatches, { Match } from '@/components/dashboard/recent-matches';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';

// Interface for jobseeker data in match card
interface JobseekerMatch {
  id: string;
  sliderValues: Record<string, number>;
  education: {
    degree: string;
    major: string;
    school: string;
  };
  locations: string[];
  workArrangements?: string[];
  industryPreferences?: string[];
}

interface DashboardData {
  stats: {
    activeJobs: number;
    profileViews: number;
    matches: number;
    interviews: number;
  };
  recentMatches: Match[];
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    workType: string;
    employmentType: string;
    status: string;
    matchCount: number;
  }>;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ['/api/employer/dashboard'],
    enabled: !!user && user.userType === USER_TYPES.EMPLOYER,
  });

  // Fetch potential matches
  const { data: potentialMatches, refetch: refetchPotentialMatches } = useQuery<JobseekerMatch[]>({
    queryKey: ['/api/employer/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.EMPLOYER,
  });

  const currentJobseeker = potentialMatches && potentialMatches.length > 0 ? potentialMatches[0] : undefined;

  // Handle interest/not interest
  const swipeMutation = useMutation({
    mutationFn: async ({ id, interested }: { id: string; interested: boolean }) => {
      const response = await apiRequest('POST', '/api/employer/swipe', { jobseekerId: id, interested });
      return response.json();
    },
    onSuccess: () => {
      refetchPotentialMatches();
      queryClient.invalidateQueries({ queryKey: ['/api/employer/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/matches/recent'] });
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
    activeJobs: 0,
    profileViews: 0,
    matches: 0,
    interviews: 0
  };

  // Use only real matches data from API
  const recentMatches = dashboardData?.recentMatches || [];

  return (
    <DashboardLayout 
      title="Company Dashboard" 
      subtitle={user?.companyName ? `Welcome back, ${user.companyName}!` : 'Welcome back!'}
    >
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0"></div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button asChild>
            <a href="/employer/jobs/new">Post a Job</a>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats userType={USER_TYPES.EMPLOYER} stats={stats} />

      {/* Job Postings */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Job Postings</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your current job openings.</p>
          </div>
          <Button 
            size="sm"
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Job
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.jobs?.length > 0 ? (
                dashboardData.jobs.map((job: any) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location}</div>
                      <div className="text-sm text-gray-500">{job.workType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.employmentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.matchCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/employer/jobs/${job.id}`} className="text-primary hover:text-primary/80">Edit</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No job postings yet. Get started by adding a new job.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Feed */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Talent Match Feed</h3>
          <p className="mt-1 text-sm text-gray-500">Find potential candidates by swiping through anonymous profiles.</p>
        </div>
        <div className="px-4 py-6 sm:p-6">
          {potentialMatches?.length ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Showing anonymous profiles that match your company's requirements. 
                  Swipe right on profiles you're interested in connecting with.
                </p>
              </div>
              <MatchCard
                userType={USER_TYPES.EMPLOYER}
                data={currentJobseeker as JobseekerMatch}
                onInterested={handleInterested}
                onNotInterested={handleNotInterested}
                isPending={swipeMutation.isPending}
              />
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  {potentialMatches.length > 1 
                    ? `${potentialMatches.length - 1} more profiles waiting` 
                    : "Last profile in the queue"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No potential candidates</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no more profiles to review at this time.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => refetchPotentialMatches()}
                  className="inline-flex items-center"
                >
                  <svg 
                    className="-ml-1 mr-2 h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Refresh Candidates
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <RecentMatches 
        matches={recentMatches} 
        emptyMessage="You haven't matched with any candidates yet. Start swiping to find matches!"
        viewAllLink="/employer/matches"
      />
    </DashboardLayout>
  );
}
