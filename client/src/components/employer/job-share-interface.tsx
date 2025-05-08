import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, Briefcase, SendIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { JobPosting, User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Job Share Interface Component
 * 
 * Allows employers to share their job postings with matched jobseekers
 * - Shows a list of the employer's job postings
 * - Allows multi-select of jobs to share
 * - Provides confirmation and success feedback
 */
export function JobShareInterface({
  matchId,
  jobseeker,
  onComplete
}: {
  matchId: string;
  jobseeker: User;
  onComplete?: () => void;
}) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch employer's job postings
  const { data: jobPostings, isLoading } = useQuery({
    queryKey: ['/api/jobs/employer'],
    queryFn: async () => {
      const res = await fetch('/api/jobs/employer');
      if (!res.ok) throw new Error('Failed to fetch job postings');
      return res.json() as Promise<JobPosting[]>;
    }
  });
  
  // Mutation to share jobs with a jobseeker
  const shareJobsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        'POST', 
        `/api/matches/${matchId}/share-jobs`,
        { jobPostingIds: selectedJobs }
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      
      // Show success toast
      toast({
        title: 'Jobs shared successfully',
        description: `${selectedJobs.length} jobs shared with ${jobseeker.firstName || 'jobseeker'}`,
        variant: 'default',
      });
      
      // Close dialog and call onComplete callback
      setIsDialogOpen(false);
      if (onComplete) onComplete();
    },
    onError: (error) => {
      console.error('Error sharing jobs:', error);
      toast({
        title: 'Failed to share jobs',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  });
  
  // Toggle job selection
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };
  
  // Handle share button click
  const handleShareClick = () => {
    if (selectedJobs.length === 0) {
      toast({
        title: 'No jobs selected',
        description: 'Please select at least one job to share',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  // Handle confirm share
  const handleConfirmShare = () => {
    shareJobsMutation.mutate();
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Share Jobs
          </CardTitle>
          <CardDescription>
            Share relevant job postings with {jobseeker.firstName || 'this jobseeker'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : jobPostings && jobPostings.length > 0 ? (
            <div className="space-y-3">
              {jobPostings.map((job) => (
                <div 
                  key={job.id}
                  className={`p-3 border rounded-lg flex items-start gap-3 transition-colors ${
                    selectedJobs.includes(job.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox 
                    id={`job-${job.id}`} 
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={() => toggleJobSelection(job.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`job-${job.id}`}
                      className="font-medium cursor-pointer block"
                    >
                      {job.title}
                    </label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {job.location}
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {job.jobType && (
                        <Badge variant="outline">{job.jobType}</Badge>
                      )}
                      {job.workArrangement && (
                        <Badge variant="outline">{job.workArrangement}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No job postings found</p>
              <Button 
                variant="link" 
                asChild 
                className="mt-2"
              >
                <a href="/employer/jobs/create">Create a job posting</a>
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onComplete}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShareClick}
            disabled={selectedJobs.length === 0 || isLoading || shareJobsMutation.isPending}
            className="flex items-center gap-2"
          >
            <SendIcon className="h-4 w-4" />
            Share Selected Jobs
            {selectedJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1">{selectedJobs.length}</Badge>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Job Sharing</DialogTitle>
            <DialogDescription>
              You're about to share {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} with {jobseeker.firstName || 'this jobseeker'}.
              They will be notified about these opportunities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="font-medium mb-2">Selected Jobs:</h4>
            <ul className="space-y-2">
              {jobPostings?.filter(job => selectedJobs.includes(job.id))
                .map(job => (
                  <li key={job.id} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>{job.title}</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmShare}
              disabled={shareJobsMutation.isPending}
            >
              {shareJobsMutation.isPending ? 'Sharing...' : 'Confirm & Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}