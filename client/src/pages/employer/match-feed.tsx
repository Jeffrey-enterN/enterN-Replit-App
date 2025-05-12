import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import MatchCard from '@/components/dashboard/match-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

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
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);

  // Redirect if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  // Fetch potential matches
  const { 
    data: potentialMatches, 
    refetch: refetchPotentialMatches, 
    isLoading,
    isRefetching
  } = useQuery<JobseekerMatch[]>({
    queryKey: ['/api/employer/matches/potential'],
    enabled: !!user && user.userType === USER_TYPES.EMPLOYER,
    staleTime: 0, // Force refetch every time
  });

  const currentJobseeker = potentialMatches && potentialMatches.length > 0 ? potentialMatches[0] : undefined;

  // Handle interest/not interest
  const swipeMutation = useMutation({
    mutationFn: async ({ id, interested }: { id: string; interested: boolean }) => {
      setIsProcessingSwipe(true);
      const response = await apiRequest('POST', '/api/employer/swipe', { jobseekerId: id, interested });
      return response.json();
    },
    onSuccess: async () => {
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/employer/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/matches/recent'] });

      // Clear existing matches data from cache to force a fresh fetch
      queryClient.removeQueries({ queryKey: ['/api/employer/matches/potential'] });
      
      // After a successful swipe, automatically load the next candidate
      try {
        await refetchPotentialMatches();
      } catch (error) {
        console.error('Error refetching potential matches:', error);
      }
      
      // If there are no more matches, show a success toast
      if (!potentialMatches || potentialMatches.length <= 1) {
        toast({
          title: 'Caught up!',
          description: 'You\'ve reviewed all available candidates. Check back soon for more matches.',
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

  // Format jobseeker data for display
  const formatJobseekerData = (jobseeker: JobseekerMatch) => {
    // Return the data in the format expected by the MatchCard component
    // Adding more console logs to debug
    console.log("Formatting jobseeker data:", jobseeker);
    
    // Make sure to only use the actual data that exists
    return {
      id: jobseeker.id,
      education: {
        degree: jobseeker.education?.degree || '',
        major: jobseeker.education?.major || '',
        school: jobseeker.education?.school || ''
      },
      locations: Array.isArray(jobseeker.locations) ? jobseeker.locations : [],
      workArrangements: Array.isArray(jobseeker.workArrangements) ? jobseeker.workArrangements : [],
      industryPreferences: Array.isArray(jobseeker.industryPreferences) ? jobseeker.industryPreferences : [],
      sliderValues: jobseeker.sliderValues && typeof jobseeker.sliderValues === 'object' ? jobseeker.sliderValues : {}
    };
  };

  // Determine if we should show the loading state
  const showLoadingState = isLoading || isRefetching || isProcessingSwipe || swipeMutation.isPending;
  
  return (
    <DashboardLayout title="Match Feed" subtitle="Discover potential candidates">
      <div className="container mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Match Feed</h1>
            <p className="text-muted-foreground">
              Find your next great hire
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/employer/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/employer/optimized-match-feed')}
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Optimized Feed
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetchPotentialMatches()} 
              disabled={isRefetching}
            >
              {isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-6">
        {showLoadingState ? (
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
              isPending={false} // We're handling loading state at the page level now
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">You've reviewed all available candidates!</h3>
            <p className="mt-2 text-sm text-gray-500">
              You've reviewed all available jobseeker profiles. Check back soon as new candidates join the platform every day.
            </p>
            <div className="mt-6 space-y-4">
              <Button 
                className="w-full max-w-xs" 
                variant="outline"
                onClick={() => {
                  setIsProcessingSwipe(true);
                  queryClient.removeQueries({ queryKey: ['/api/employer/matches/potential'] });
                  refetchPotentialMatches().finally(() => setIsProcessingSwipe(false));
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for new candidates
              </Button>
              
              <Button 
                className="w-full max-w-xs" 
                variant="outline"
                onClick={() => navigate('/employer/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}