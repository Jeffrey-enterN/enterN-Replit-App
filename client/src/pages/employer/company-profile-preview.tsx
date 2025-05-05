import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import MatchCard from '@/components/dashboard/match-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

// Simulated employer match data structure for preview
interface PreviewEmployerMatch {
  id: string;
  name: string;
  location: string;
  description: string;
  positions: string[];
  logo?: string;
}

export default function CompanyProfilePreview() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [previewData, setPreviewData] = useState<PreviewEmployerMatch | null>(null);

  useEffect(() => {
    // Redirect if not employer
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/');
      return;
    }

    // Get profile data from session storage
    const storedData = sessionStorage.getItem('company_profile_preview');
    if (storedData) {
      try {
        const formData = JSON.parse(storedData);
        
        // Create preview data from form data
        setPreviewData({
          id: '0', // Placeholder
          name: formData.name || 'Your Company',
          location: formData.headquarters || 'Location not specified',
          description: formData.about || 'No company description provided.',
          positions: ['Software Engineer', 'Product Manager', 'Data Scientist'], // Example positions
          // Note: We don't handle logo previews for simplicity
        });
      } catch (error) {
        console.error('Error parsing preview data:', error);
      }
    } else {
      // If no data in storage, use current user data if available
      if (user && user.companyName) {
        setPreviewData({
          id: '0', // Placeholder
          name: user.companyName,
          location: 'Company Location',
          description: 'This is how your company profile appears to jobseekers in their match feed.',
          positions: ['Example Position 1', 'Example Position 2'],
        });
      }
    }
  }, [user, navigate]);

  const handleInterested = () => {
    // Just a placeholder function for the preview
    alert('This is just a preview. In the actual app, jobseekers would use this button to express interest in your company.');
  };

  const handleNotInterested = () => {
    // Just a placeholder function for the preview
    alert('This is just a preview. In the actual app, jobseekers would use this button to decline interest in your company.');
  };

  return (
    <DashboardLayout title="Company Profile Preview">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/employer/company-profile')}
          className="mb-4 pl-0 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Company Profile
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Profile Preview</CardTitle>
            <CardDescription>
              This is how your company profile will appear to jobseekers in their match feed. 
              The preview uses your current form data to simulate the appearance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-6">
              <p className="font-medium">Preview Notes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>The preview shows how your company profile would appear to candidates</li>
                <li>All profile information is translated 1:1 from your company profile form</li>
                <li>In the actual feed, jobseekers will be able to swipe or click buttons to express interest</li>
                <li>The job positions shown here are examples only</li>
              </ul>
            </div>
            
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-4 text-center">Jobseeker View</h3>
              {previewData ? (
                <MatchCard 
                  userType={USER_TYPES.JOBSEEKER}
                  data={previewData}
                  onInterested={handleInterested}
                  onNotInterested={handleNotInterested}
                />
              ) : (
                <div className="text-center p-10 border rounded-lg bg-muted/20">
                  <p>No preview data available. Please fill out your company profile form.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}