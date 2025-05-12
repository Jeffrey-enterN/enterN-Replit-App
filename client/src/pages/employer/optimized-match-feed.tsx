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
import { Loader2, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface PaginationMeta {
  limit: number;
  offset: number;
  total?: number;
}

interface MatchFeedResponse {
  success: boolean;
  data: JobseekerMatch[];
  pagination: PaginationMeta;
}

export default function OptimizedMatchFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('match');
  const [sortDirection, setSortDirection] = useState('desc');

  // Redirect if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  // Calculate offset based on current page and page size
  const offset = (currentPage - 1) * pageSize;

  // Fetch potential matches with pagination
  const {
    data: matchResponse,
    refetch: refetchPotentialMatches,
    isLoading,
    isRefetching
  } = useQuery<MatchFeedResponse>({
    queryKey: ['/api/matches/feed', { limit: pageSize, offset, sortBy, sortDirection }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey as [string, { 
        limit: number;
        offset: number;
        sortBy: string;
        sortDirection: string;
      }];
      const queryParams = new URLSearchParams({
        limit: params.limit.toString(),
        offset: params.offset.toString(),
        sortBy: params.sortBy,
        sortDirection: params.sortDirection
      });
      
      const response = await fetch(`/api/matches/feed?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      return response.json();
    },
    enabled: !!user && user.userType === USER_TYPES.EMPLOYER,
    staleTime: 0, // Force refetch every time
  });

  const potentialMatches = matchResponse?.data || [];
  const pagination = matchResponse?.pagination || { limit: pageSize, offset, total: 0 };
  const totalPages = pagination.total ? Math.ceil(pagination.total / pageSize) : 0;

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

      // Invalidate the current page of matches
      queryClient.invalidateQueries({ 
        queryKey: ['/api/matches/feed', { limit: pageSize, offset, sortBy, sortDirection }] 
      });
      
      // After a successful swipe, automatically load the next candidate
      try {
        await refetchPotentialMatches();
      } catch (error) {
        console.error('Error refetching potential matches:', error);
      }
      
      // If there are no more matches, show a success toast
      if (!potentialMatches || potentialMatches.length === 0) {
        toast({
          title: 'Caught up!',
          description: 'You\'ve reviewed all available candidates on this page. Try another page or check back soon for more matches.',
        });
      }
      
      setIsProcessingSwipe(false);
    },
    onError: (error) => {
      console.error('Error during swipe operation:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong processing your response. Please try again.',
        variant: 'destructive'
      });
      setIsProcessingSwipe(false);
    }
  });

  // Handle match interest (equivalent to swiping right)
  const handleInterest = () => {
    if (currentJobseeker && !isProcessingSwipe) {
      swipeMutation.mutate({ id: currentJobseeker.id, interested: true });
    }
  };

  // Handle match disinterest (equivalent to swiping left)
  const handleDisinterest = () => {
    if (currentJobseeker && !isProcessingSwipe) {
      swipeMutation.mutate({ id: currentJobseeker.id, interested: false });
    }
  };

  // Handle pagination changes
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle sort changes
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  const handleSortDirectionChange = (value: string) => {
    setSortDirection(value as 'asc' | 'desc');
    setCurrentPage(1); // Reset to first page when changing sort direction
  };

  // Handle page size changes
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <DashboardLayout title="Match Feed (Optimized)">
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Match Feed (Optimized)</h1>
            <p className="text-muted-foreground">
              Review potential matches with efficient pagination
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/employer/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/employer/match-feed')}
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Standard Match Feed
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

        {/* Sorting and filtering controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Default</SelectItem>
                <SelectItem value="match">Match Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Direction:</span>
            <Select value={sortDirection} onValueChange={handleSortDirectionChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading potential matches...</p>
          </div>
        )}

        {/* No matches state */}
        {!isLoading && (!potentialMatches || potentialMatches.length === 0) && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <p className="text-xl">No more matches to show</p>
            <p className="text-muted-foreground mt-2">
              You've reviewed all potential matches. Check back later or try another page.
            </p>
            <Button onClick={() => refetchPotentialMatches()} className="mt-4">
              Refresh
            </Button>
          </div>
        )}

        {/* Match cards */}
        {!isLoading && potentialMatches && potentialMatches.length > 0 && (
          <div className="space-y-8">
            {potentialMatches.map((jobseeker) => (
              <div key={jobseeker.id} className="border rounded-lg p-4 shadow-sm">
                <MatchCard
                  userType={USER_TYPES.EMPLOYER}
                  data={jobseeker}
                  onInterested={() => 
                    swipeMutation.mutate({ id: jobseeker.id, interested: true })
                  }
                  onNotInterested={() => 
                    swipeMutation.mutate({ id: jobseeker.id, interested: false })
                  }
                  isPending={isProcessingSwipe}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={goToPreviousPage} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => goToPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => goToPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={goToNextPage} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing {offset + 1}-{Math.min(offset + pageSize, pagination.total || 0)} of {pagination.total || 0} matches
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}