import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import JobseekerLayout from '@/components/layouts/jobseeker-layout';
import MatchCard from '@/components/dashboard/match-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

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
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);

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
    isRefetching 
  } = useQuery({
    queryKey: ['/api/jobseeker/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.JOBSEEKER,
    staleTime: 0, // Force refetch every time
  });

  const currentEmployer = Array.isArray(potentialMatches) && potentialMatches.length > 0 
    ? potentialMatches[0] as EmployerMatch 
    : undefined;

  // Handle interest/not interest
  const swipeMutation = useMutation({
    mutationFn: async ({ id, interested }: { id: string; interested: boolean }) => {
      setIsProcessingSwipe(true);
      const response = await apiRequest('POST', '/api/jobseeker/swipe', { employerId: id, interested });
      return response.json();
    },
    onSuccess: async () => {
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/matches/recent'] });

      // Clear existing matches data from cache to force a fresh fetch
      queryClient.removeQueries({ queryKey: ['/api/jobseeker/matches/potential'] });
      
      // After a successful swipe, automatically load the next candidate
      try {
        await refetchPotentialMatches();
      } catch (error) {
        console.error('Error refetching potential matches:', error);
      }
      
      // If there are no more matches, show a success toast
      if (!potentialMatches || (Array.isArray(potentialMatches) && potentialMatches.length <= 1)) {
        toast({
          title: 'Caught up!',
          description: 'You\'ve reviewed all available opportunities. Check back soon for more matches.',
        });
      }
      
      // Reset processing state
      setIsProcessingSwipe(false);
    },
    onError: (error: Error) => {
      setIsProcessingSwipe(false);
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
  
  // Reset all swipes for testing
  const resetSwipesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/test/jobseeker/reset-swipes', {});
      return response.json();
    },
    onSuccess: (data) => {
      // Show a success toast with how many swipes were reset
      toast({
        title: 'Rejected Companies Reset',
        description: data.message || `Successfully reset ${data.count} previously rejected companies.`,
      });
      
      // Clear existing matches data from cache and fetch new matches
      queryClient.removeQueries({ queryKey: ['/api/jobseeker/matches/potential'] });
      refetchPotentialMatches();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Resetting Rejected Companies',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleResetSwipes = () => {
    resetSwipesMutation.mutate();
  };

  // Determine if we should show the loading state
  const showLoadingState = isLoading || isRefetching || isProcessingSwipe || 
    swipeMutation.isPending || resetSwipesMutation.isPending;
  
  return (
    <JobseekerLayout>
      <div className="flex flex-col items-center space-y-6">
        {showLoadingState ? (
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
              isPending={false} // We're handling loading state at the page level now
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">You've reviewed all available opportunities!</h3>
            <p className="mt-2 text-sm text-gray-500">
              You've reviewed all available employer opportunities. Check back soon as new companies join the platform every day.
            </p>
            <div className="mt-6 space-y-4">
              <Button 
                className="w-full max-w-xs" 
                variant="outline"
                onClick={() => {
                  setIsProcessingSwipe(true);
                  queryClient.removeQueries({ queryKey: ['/api/jobseeker/matches/potential'] });
                  refetchPotentialMatches().finally(() => setIsProcessingSwipe(false));
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for new opportunities
              </Button>
              
              <Button 
                className="w-full max-w-xs bg-primary hover:bg-primary/90"
                onClick={handleResetSwipes}
              >
                Reset Rejected Companies
              </Button>
              
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                This will let you see previously rejected companies again, while preserving your matches.
              </p>
              
              <Button 
                className="w-full max-w-xs" 
                variant="outline"
                onClick={() => navigate('/jobseeker/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
}