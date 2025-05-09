import { useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import JobseekerProfileForm from '@/components/profile/jobseeker-profile-form';
import JobseekerNavbar from '@/components/layouts/jobseeker-navbar';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';

export default function JobseekerProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated or if user is not a jobseeker
  useEffect(() => {
    if (user && user.userType !== USER_TYPES.JOBSEEKER) {
      navigate('/employer/dashboard');
    }
  }, [user, navigate]);

  const subtitle = user?.firstName 
    ? `Complete your profile to start connecting with employers, ${user.firstName}.`
    : 'Complete your profile to start connecting with employers.';

  // Default to 'Create Your Profile' as title
  const title = 'Create Your Profile';

  return (
    <>
      <JobseekerNavbar />
      <DashboardLayout title={title} subtitle={subtitle}>
        <JobseekerProfileForm />
      </DashboardLayout>
    </>
  );
}
