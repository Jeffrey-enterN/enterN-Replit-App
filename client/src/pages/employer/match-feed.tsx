import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import MatchCard from '@/components/dashboard/match-card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface JobseekerMatch {
  id: string;
  education?: {
    degree: string;
    major: string;
    school: string;
  };
  locations?: string[];
  workArrangements?: string[];
  industryPreferences?: string[];
  sliderValues?: Record<string, number>;
}

export default function EmployerMatchFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  // Fetch potential matches
  const { data: potentialMatches, refetch: refetchPotentialMatches, isLoading } = useQuery<JobseekerMatch[]>({
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

  // Format jobseeker data for display
  const formatJobseekerData = (jobseeker: JobseekerMatch) => {
    // Return the data in the format expected by the MatchCard component
    return {
      id: jobseeker.id,
      education: jobseeker.education || {
        degree: '',
        major: '',
        school: ''
      },
      locations: jobseeker.locations || [],
      sliderValues: jobseeker.sliderValues || {}
    };
  };

  return (
    <DashboardLayout title="Match Feed" subtitle="Discover potential candidates">
      <div className="flex flex-col items-center space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentJobseeker ? (
          <div className="w-full max-w-2xl">
            <MatchCard
              userType={USER_TYPES.EMPLOYER}
              data={formatJobseekerData(currentJobseeker)}
              onInterested={() => handleInterested(currentJobseeker.id)}
              onNotInterested={() => handleNotInterested(currentJobseeker.id)}
              isPending={swipeMutation.isPending}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No more matches to show</h3>
            <p className="mt-2 text-sm text-gray-500">
              We're working on finding more great candidates for you. Check back soon!
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => refetchPotentialMatches()}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}