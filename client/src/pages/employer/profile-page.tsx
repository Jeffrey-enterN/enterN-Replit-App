import { useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import EmployerProfileForm from '@/components/profile/employer-profile-form';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated or if user is not an employer
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.EMPLOYER) {
      navigate('/jobseeker/dashboard');
    }
  }, [user, navigate]);

  const subtitle = user?.companyName 
    ? `Complete your company profile to start connecting with talented candidates, ${user.companyName}.`
    : 'Complete your company profile to start connecting with talented candidates.';

  const title = user?.companyProfile?.id ? 'Edit Company Profile' : 'Company Profile';

  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      <EmployerProfileForm />
    </DashboardLayout>
  );
}
