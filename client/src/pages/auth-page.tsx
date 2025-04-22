import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthLayout from '@/components/layouts/auth-layout';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import { Link } from 'wouter';
import { USER_TYPES } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Check if there's a preferred role saved in localStorage
  useEffect(() => {
    const preferredRole = localStorage.getItem('preferred_role');
    if (preferredRole) {
      setIsLogin(false); // Show registration form if a role preference exists
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

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <AuthLayout
      title={isLogin ? 'Sign in to your account' : 'Create your account'}
      subtitle={
        isLogin ? (
          <>
            Or{' '}
            <button 
              onClick={toggleForm} 
              className="font-medium text-primary hover:text-primary/80"
            >
              create a new account
            </button>
          </>
        ) : (
          <>
            Or{' '}
            <button 
              onClick={toggleForm} 
              className="font-medium text-primary hover:text-primary/80"
            >
              sign in to your account
            </button>
          </>
        )
      }
    >
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </AuthLayout>
  );
}
