import { useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthLayout from '@/components/layouts/auth-layout';
import LoginForm from '@/components/auth/login-form';
import { Link } from 'wouter';
import { USER_TYPES } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';

export default function SignInPage() {
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

  return (
    <AuthLayout
      title={<>Sign in to your <span className="text-gradient font-extrabold">account</span></>}
      subtitle={
        <>
          Don't have an account?{' '}
          <Link 
            to="/sign-up" 
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}