import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { JobPosting, Match } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, BadgeCheck, BadgeX, Clock, MapPin, Building, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import websocketManager from '@/lib/websocket-manager';

/**
 * Job Interest Toggle Component
 * 
 * Allows jobseekers to express interest in jobs shared by employers
 * - Shows job details with company information
 * - Simple toggle UI to express interest
 * - Triggers interview scheduling when interest is expressed
 */
export function JobInterestToggle({
  job,
  match,
  onInterestToggled,
  onScheduleInterview
}: {
  job: JobPosting;
  match: Match;
  onInterestToggled?: (interested: boolean) => void;
  onScheduleInterview?: () => void;
}) {
  const [interested, setInterested] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation to express interest in a job
  const toggleInterestMutation = useMutation({
    mutationFn: async (isInterested: boolean) => {
      const res = await apiRequest(
        'POST',
        `/api/jobs/${job.id}/interest`,
        { interested: isInterested }
      );
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${match.id}`] });
      
      // Show success message
      toast({
        title: variables ? 'Interest expressed' : 'Interest removed',
        description: variables 
          ? 'The employer will be notified of your interest' 
          : 'You have removed your interest in this job',
        variant: 'default',
      });
      
      // If interest was expressed, trigger scheduling workflow
      if (variables && data.schedulingEnabled && onScheduleInterview) {
        // Wait a moment before showing the scheduler
        setTimeout(() => {
          onScheduleInterview();
        }, 1000);
      }
      
      // Call the callback if provided
      if (onInterestToggled) {
        onInterestToggled(variables);
      }
    },
    onError: (error) => {
      console.error('Error toggling job interest:', error);
      toast({
        title: 'Failed to update interest',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      // Reset the toggle state
      setInterested(!interested);
    }
  });
  
  // Handle toggle change
  const handleToggleChange = (checked: boolean) => {
    setInterested(checked);
    toggleInterestMutation.mutate(checked);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Briefcase className="mr-2 h-5 w-5" />
            {job.title}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor={`interest-toggle-${job.id}`} className="mr-2 text-sm font-medium">
              Interested in this job?
            </Label>
            <Switch
              id={`interest-toggle-${job.id}`}
              checked={interested}
              onCheckedChange={handleToggleChange}
              disabled={toggleInterestMutation.isPending}
            />
          </div>
        </div>
        
        <CardDescription className="flex items-center mt-1">
          <Building className="mr-1 h-4 w-4" />
          {job.companyName || 'Company'} · 
          <Clock className="mx-1 h-4 w-4" /> 
          {job.jobType || 'Full-time'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {job.location && (
            <Badge variant="outline" className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              {job.location}
            </Badge>
          )}
          
          {job.workArrangement && (
            <Badge variant="outline">
              {job.workArrangement}
            </Badge>
          )}
          
          {job.salaryRange && (
            <Badge variant="outline">
              {job.salaryRange}
            </Badge>
          )}
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Job Description</h4>
          <div className="text-sm text-muted-foreground">
            {job.description ? (
              <p className="whitespace-pre-line">{job.description}</p>
            ) : (
              <p className="italic">No description provided</p>
            )}
          </div>
        </div>
        
        {job.requirements && (
          <div className="mt-3">
            <h4 className="font-medium mb-2">Requirements</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {job.requirements}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {interested ? (
            <span className="flex items-center text-green-600">
              <BadgeCheck className="mr-1 h-4 w-4" />
              You've expressed interest in this job
            </span>
          ) : (
            <span className="flex items-center">
              <BadgeX className="mr-1 h-4 w-4" />
              You haven't expressed interest yet
            </span>
          )}
        </div>
        
        {interested && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onScheduleInterview}
          >
            <Calendar className="mr-1 h-4 w-4" />
            Schedule Interview
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Shared Jobs List Component
 * 
 * Displays a list of jobs shared by an employer in a match
 */
export function SharedJobsList({
  jobs,
  match,
  onScheduleInterview
}: {
  jobs: JobPosting[];
  match: Match;
  onScheduleInterview?: (jobId: string) => void;
}) {
  // Set up websocket for real-time updates
  React.useEffect(() => {
    // Connect to websocket
    websocketManager.connect();
    
    // Listen for job-related events
    websocketManager.on('job_shared', message => {
      if (message.payload?.matchId === match.id) {
        // Invalidate job-related queries when new jobs are shared
        const queryClient = useQueryClient();
        queryClient.invalidateQueries({ queryKey: [`/api/matches/${match.id}/jobs`] });
      }
    });
    
    return () => {
      // Clean up event listener
      websocketManager.off('job_shared', () => {});
    };
  }, [match.id]);
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Shared Job Opportunities</h3>
      
      {jobs.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-8 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h4 className="text-lg font-medium mb-2">No jobs shared yet</h4>
          <p className="text-muted-foreground">
            Jobs shared by the employer will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <JobInterestToggle
              key={job.id}
              job={job}
              match={match}
              onScheduleInterview={() => onScheduleInterview?.(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}