import { useEffect, useState } from 'react';
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

// Interface for employer data in match card
interface EmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
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

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/jobseeker/dashboard'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });

  // Fetch potential matches
  const { data: potentialMatches, refetch: refetchPotentialMatches } = useQuery({
    queryKey: ['/api/jobseeker/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });

  const currentEmployer = potentialMatches?.[0] as EmployerMatch | undefined;

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

  // Sample matches (will be replaced by actual API data)
  const mockRecentMatches: Match[] = [
    {
      id: '1',
      name: 'InnovateTech',
      matchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'interview-scheduled',
      statusText: 'Software Engineer Intern • May 10, 2023',
    },
    {
      id: '2',
      name: 'Future Growth',
      matchDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      status: 'shared-jobs',
      statusText: '3 open positions • Data Science, Marketing',
    },
  ];

  const recentMatches = dashboardData?.recentMatches || mockRecentMatches;

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome back!'}
    >
      {/* Overview Stats */}
      <OverviewStats userType={USER_TYPES.JOBSEEKER} stats={stats} />

      {/* Match Feed */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Match Feed</h3>
          <p className="mt-1 text-sm text-gray-500">Find your next opportunity by swiping on employers.</p>
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
            <div className="text-center py-12 text-gray-500">
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
    </DashboardLayout>
  );
}
