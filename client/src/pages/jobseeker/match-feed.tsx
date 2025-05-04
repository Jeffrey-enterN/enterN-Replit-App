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

interface EmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
}

export default function JobseekerMatchFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or if user is not a jobseeker
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.JOBSEEKER) {
      navigate('/employer/dashboard');
    }
  }, [user, navigate]);

  // Fetch potential matches
  const { 
    data: potentialMatches, 
    refetch: refetchPotentialMatches, 
    isLoading,
    isFetching 
  } = useQuery({
    queryKey: ['/api/jobseeker/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
  });

  const currentEmployer = Array.isArray(potentialMatches) && potentialMatches.length > 0 
    ? potentialMatches[0] as EmployerMatch 
    : undefined;

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

  return (
    <DashboardLayout title="Match Feed" subtitle="Discover new opportunities">
      <div className="flex flex-col items-center space-y-6">
        {isLoading || isFetching || swipeMutation.isPending ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentEmployer ? (
          <div className="w-full max-w-2xl">
            <MatchCard
              userType={USER_TYPES.JOBSEEKER}
              data={currentEmployer}
              onInterested={handleInterested}
              onNotInterested={handleNotInterested}
              isPending={false}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No more matches to show</h3>
            <p className="mt-2 text-sm text-gray-500">
              We're working on finding more great opportunities for you. Check back soon!
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