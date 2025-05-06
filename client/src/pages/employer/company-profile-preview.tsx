import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CompanyProfileCard from '@/components/profile/company-profile-card';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';

export default function CompanyProfilePreview() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  // Fetch company profile data
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['/api/employer/company'],
    enabled: !!user && user.userType === USER_TYPES.EMPLOYER && !!user.companyId,
  });

  // Check if company profile exists
  const hasCompanyProfile = !!user?.companyId;
  
  return (
    <DashboardLayout title="Company Profile Preview">
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Profile Preview</h1>
            <p className="text-muted-foreground mt-1">
              Preview how your company appears to jobseekers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/employer/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate('/employer/company-profile')}>
              {hasCompanyProfile ? 'Edit Profile' : 'Create Profile'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Card Preview</h2>
          <p className="text-muted-foreground mb-6">
            This is how your company profile appears to jobseekers in the match feed. A compelling profile
            increases your chances of matching with qualified candidates.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !hasCompanyProfile ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Company Profile Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You haven't created a company profile yet. Create a profile to start matching with candidates.
              </p>
              <Button onClick={() => navigate('/employer/company-profile')}>
                Create Company Profile
              </Button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <CompanyProfileCard 
                companyData={companyData || {
                  name: user?.companyName || 'Your Company',
                }}
                showPreviewHeader={true}
              />
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Tips</h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="bg-primary/20 rounded-full p-1 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
              </div>
              <div>
                <h3 className="font-medium">Complete All Sections</h3>
                <p className="text-muted-foreground text-sm">
                  Companies with complete profiles are 70% more likely to receive likes from jobseekers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-primary/20 rounded-full p-1 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
              </div>
              <div>
                <h3 className="font-medium">Add Your Logo</h3>
                <p className="text-muted-foreground text-sm">
                  Profiles with logos receive 40% more attention from jobseekers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-primary/20 rounded-full p-1 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</div>
              </div>
              <div>
                <h3 className="font-medium">Highlight Your Culture</h3>
                <p className="text-muted-foreground text-sm">
                  Culture sliders help match you with candidates who share your company's values.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-primary/20 rounded-full p-1 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs">4</div>
              </div>
              <div>
                <h3 className="font-medium">Specify Work Arrangements</h3>
                <p className="text-muted-foreground text-sm">
                  Clear work arrangements help match with candidates who fit your workplace model.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}