import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import ContactDetailsForm from '@/components/auth/contact-details-form';
import AuthLayout from '@/components/layouts/auth-layout';
import { Loader2 } from 'lucide-react';

export default function ContactDetailsPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If the user isn't logged in, redirect to auth page
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, return null (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  return (
    <AuthLayout 
      title="Complete Your Profile" 
      subtitle={
        <p>
          Your account has been created. Now, let's add some more information to help us 
          personalize your experience.
        </p>
      }
    >
      <ContactDetailsForm />
    </AuthLayout>
  );
}