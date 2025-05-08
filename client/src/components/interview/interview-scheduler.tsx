import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfDay, addHours, isBefore, set } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import websocketManager from '@/lib/websocket-manager';

// Available time slots for interviews
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

// Interview types
const INTERVIEW_TYPES = [
  { id: 'video', label: 'Video Call' },
  { id: 'phone', label: 'Phone Call' },
  { id: 'in-person', label: 'In-Person' }
];

/**
 * Interview Scheduler Component
 * 
 * Allows scheduling interviews after a jobseeker expresses interest in a job
 * - Calendar interface for date selection
 * - Time slot picker for available times
 * - Interview type selection
 * - Confirmation workflow and notifications
 */
export function InterviewScheduler({
  matchId,
  jobPostingId,
  employerName,
  onScheduled,
  onCancel
}: {
  matchId: string;
  jobPostingId: string;
  employerName: string;
  onScheduled?: () => void;
  onCancel?: () => void;
}) {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState<string | undefined>();
  const [interviewType, setInterviewType] = useState<string>('video');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation to schedule an interview
  const scheduleInterviewMutation = useMutation({
    mutationFn: async () => {
      if (!date || !timeSlot) {
        throw new Error('Please select a date and time');
      }
      
      // Parse the time slot and create a datetime
      const [hour, minute, period] = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) || [];
      let hourNum = parseInt(hour);
      if (period === 'PM' && hourNum < 12) hourNum += 12;
      if (period === 'AM' && hourNum === 12) hourNum = 0;
      
      // Create the scheduled date
      const scheduledDate = set(date, {
        hours: hourNum,
        minutes: parseInt(minute),
        seconds: 0,
        milliseconds: 0
      });
      
      const res = await apiRequest(
        'POST',
        `/api/matches/${matchId}/schedule`,
        {
          scheduledAt: scheduledDate.toISOString(),
          interviewStatus: 'scheduled',
          interviewType
        }
      );
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
      
      // Send notification via websocket
      websocketManager.send({
        type: 'interview_scheduled',
        payload: {
          matchId,
          jobPostingId,
          scheduledAt: combineDateTime(),
          interviewType
        }
      });
      
      // Show success toast
      toast({
        title: 'Interview Scheduled',
        description: `Your interview is scheduled for ${formatScheduledDateTime()}`,
        variant: 'default',
      });
      
      // Close confirmation dialog and call callback
      setIsConfirmOpen(false);
      if (onScheduled) onScheduled();
    },
    onError: (error) => {
      console.error('Error scheduling interview:', error);
      toast({
        title: 'Failed to schedule interview',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setIsConfirmOpen(false);
    }
  });
  
  // Combine date and time into a single Date object
  const combineDateTime = (): Date | null => {
    if (!date || !timeSlot) return null;
    
    const [hour, minute, period] = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) || [];
    let hourNum = parseInt(hour);
    if (period === 'PM' && hourNum < 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;
    
    return set(date, {
      hours: hourNum,
      minutes: parseInt(minute),
      seconds: 0,
      milliseconds: 0
    });
  };
  
  // Format the scheduled date and time for display
  const formatScheduledDateTime = (): string => {
    const dateTime = combineDateTime();
    if (!dateTime) return 'Not scheduled';
    
    return `${format(dateTime, 'EEEE, MMMM d, yyyy')} at ${timeSlot}`;
  };
  
  // Handle schedule button click
  const handleScheduleClick = () => {
    if (!date) {
      toast({
        title: 'Date required',
        description: 'Please select a date for your interview',
        variant: 'destructive',
      });
      return;
    }
    
    if (!timeSlot) {
      toast({
        title: 'Time required',
        description: 'Please select a time slot for your interview',
        variant: 'destructive',
      });
      return;
    }
    
    // Show confirmation dialog
    setIsConfirmOpen(true);
  };
  
  // Handle confirmation
  const handleConfirm = () => {
    scheduleInterviewMutation.mutate();
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Schedule Your Interview</CardTitle>
          <CardDescription>
            Pick a date and time that works for your interview with {employerName || 'the employer'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="interview-date">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="interview-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label htmlFor="interview-time">Select Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="interview-time" className="w-full">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Interview Type */}
          <div className="space-y-3">
            <Label>Interview Type</Label>
            <RadioGroup
              value={interviewType}
              onValueChange={setInterviewType}
              className="grid grid-cols-3 gap-4"
            >
              {INTERVIEW_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={`interview-type-${type.id}`} />
                  <Label htmlFor={`interview-type-${type.id}`}>{type.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Selected Schedule Summary */}
          {date && timeSlot && (
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-sm mb-2">Your selected schedule:</h4>
              <p className="text-sm">{formatScheduledDateTime()}</p>
              <p className="text-sm mt-1">Interview type: {
                INTERVIEW_TYPES.find(t => t.id === interviewType)?.label || interviewType
              }</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={scheduleInterviewMutation.isPending}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleScheduleClick}
            disabled={!date || !timeSlot || scheduleInterviewMutation.isPending}
          >
            Schedule Interview
          </Button>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Interview Schedule</DialogTitle>
            <DialogDescription>
              You're scheduling an interview with {employerName || 'the employer'}.
              Please confirm the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-start">
              <CalendarIcon className="mt-0.5 mr-2 h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Date & Time</h4>
                <p className="text-sm text-muted-foreground">{formatScheduledDateTime()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">Interview Type</h4>
              <p className="text-sm text-muted-foreground">
                {INTERVIEW_TYPES.find(t => t.id === interviewType)?.label || interviewType}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={scheduleInterviewMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={scheduleInterviewMutation.isPending}
            >
              {scheduleInterviewMutation.isPending ? (
                <span className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Scheduling...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Interview
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}