import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthLayout from '@/components/layouts/auth-layout';
import RegisterForm from '@/components/auth/register-form';
import { Link } from 'wouter';
import { USER_TYPES } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';

export default function SignUpPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Check if there's a preferred role saved in localStorage
  useEffect(() => {
    const preferredRole = localStorage.getItem('preferred_role');
    if (preferredRole) {
      // Role preference exists from landing page navigation
      console.log(`User selected role: ${preferredRole}`);
    }
  }, []);

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
      <RegisterForm />
    </AuthLayout>
  );
}