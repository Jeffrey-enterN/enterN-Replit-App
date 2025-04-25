import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { formatDate } from '@/lib/utils';

export default function JobseekerCalendar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const today = new Date();

  // Redirect if not authenticated or if user is not a jobseeker
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.JOBSEEKER) {
      navigate('/employer/dashboard');
    }
  }, [user, navigate]);

  // Sample upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Interview with Tech Solutions Inc.',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 0),
      type: 'interview',
      company: 'Tech Solutions Inc.',
      link: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Follow-up Call with InnovateTech',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 30),
      type: 'call',
      company: 'InnovateTech',
      link: 'https://zoom.us/j/1234567890',
    },
  ];

  return (
    <DashboardLayout title="Calendar" subtitle="Manage your interviews and events">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>View your upcoming interviews and events</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar 
                mode="single"
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled interviews and calls</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.company}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type === 'interview' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type === 'interview' ? 'Interview' : 'Call'}
                        </span>
                      </div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </div>
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Join link
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>Calendar integration features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  <li>Google Calendar integration</li>
                  <li>Automated reminders</li>
                  <li>Interview preparation resources</li>
                  <li>Schedule availability settings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}