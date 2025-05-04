import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import AuthLayout from '@/components/layouts/auth-layout';
import { USER_TYPES } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      if (user.userType === USER_TYPES.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    }
  }, [user, navigate]);

  // Redirect to specific sign-up page if there's a role preference
  useEffect(() => {
    const preferredRole = localStorage.getItem('preferred_role');
    if (preferredRole === USER_TYPES.JOBSEEKER) {
      navigate('/sign-up/jobseeker');
    } else if (preferredRole === USER_TYPES.EMPLOYER) {
      navigate('/sign-up/employer');
    }
    
    // Clear the preference after using it
    localStorage.removeItem('preferred_role');
  }, [navigate]);

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link 
            to="/sign-in" 
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center space-y-6">
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
          Choose your account type to get started with enterN
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mt-4">
          <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Jobseeker</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
              Looking for a job that matches your values and work style
            </p>
            <Button 
              onClick={() => navigate('/sign-up/jobseeker')}
              className="w-full"
            >
              Sign up as Jobseeker
            </Button>
          </div>
          
          <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Employer</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
              Hiring talent that aligns with your organization's values and culture
            </p>
            <Button 
              onClick={() => navigate('/sign-up/employer')}
              variant="outline"
              className="w-full"
            >
              Sign up as Employer
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}