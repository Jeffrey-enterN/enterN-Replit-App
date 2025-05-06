import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
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
    swipeAnalytics?: {
      employer: {
        likes: number;
        rejections: number;
        totalSwipes: number;
        likeRatio: number;
      };
      jobseeker: {
        likes: number;
        rejections: number;
        totalSwipes: number;
        likeRatio: number;
      };
    };
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
    <div className="container py-8">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-muted-foreground">
          {user?.companyName ? `Welcome back, ${user.companyName}!` : 'Welcome back!'}
        </p>
      </div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0"></div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 md:mt-0 md:ml-4">
          {user?.companyId && (
            <Button variant="outline" asChild>
              <a href="/employer/company-profile/preview">
                View Company Profile
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href="/employer/company-profile">
              {user?.companyId ? "Update Company Profile" : "Create Company Profile"}
            </a>
          </Button>
          <Button asChild>
            <a href="/employer/jobs/new">Post a Job</a>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats userType={USER_TYPES.EMPLOYER} stats={stats} />

      {/* Job Postings */}
      <div className="bg-card shadow-sm rounded-lg overflow-hidden mb-8 border">
        <div className="px-4 py-5 border-b border-border sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-foreground">Job Postings</h3>
            <p className="mt-1 text-sm text-muted-foreground">Manage your current job openings.</p>
          </div>
          <Button 
            size="sm"
            className="inline-flex items-center"
            onClick={() => navigate('/employer/jobs/new')}
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Job
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Matches
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {dashboardData?.jobs && dashboardData.jobs.length > 0 ? (
                dashboardData.jobs.map((job: any) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{job.location}</div>
                      <div className="text-sm text-muted-foreground">{job.workType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{job.employmentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.matchCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/employer/jobs/new`} className="text-primary hover:text-primary/80">Edit</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                    No job postings yet. Get started by adding a new job.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Feed */}
      <div className="bg-card shadow-sm rounded-lg overflow-hidden mb-8 border">
        <div className="px-4 py-5 border-b border-border sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-foreground">Talent Match Feed</h3>
            <p className="mt-1 text-sm text-muted-foreground">Find potential candidates by swiping through anonymous profiles.</p>
          </div>
          <Button onClick={() => navigate('/employer/match-feed')} className="ml-4">
            Go to Match Feed
          </Button>
        </div>
        <div className="px-4 py-6 sm:p-6">
          <div className="text-center py-6">
            {potentialMatches?.length ? (
              <>
                <svg 
                  className="mx-auto h-12 w-12 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  You have {potentialMatches.length} potential candidates waiting!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Head to the match feed to review anonymous profiles that match your company's requirements.
                </p>
              </>
            ) : (
              <>
                <svg 
                  className="mx-auto h-12 w-12 text-muted-foreground" 
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
                <h3 className="mt-2 text-sm font-medium text-foreground">No potential candidates</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  There are no more profiles to review at this time.
                </p>
              </>
            )}
            <Button
              variant={potentialMatches?.length ? "default" : "outline"}
              onClick={() => navigate('/employer/match-feed')}
              className="inline-flex items-center"
            >
              {potentialMatches?.length ? 'Review Candidates' : 'Check Match Feed'}
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <RecentMatches 
        matches={recentMatches} 
        emptyMessage="You haven't matched with any candidates yet. Start swiping to find matches!"
        viewAllLink="/employer/match-feed"
        isEmployer={true}
      />
    </div>
  );
}
