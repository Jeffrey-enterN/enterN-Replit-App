import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import AuthLayout from '@/components/layouts/auth-layout';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

// Form schema for jobseeker registration
const formSchema = z.object({
  username: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;

export default function JobseekerSignUpPage() {
  const { user, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to dashboard if already logged in as a jobseeker
  useEffect(() => {
    if (user) {
      if (user.userType === USER_TYPES.JOBSEEKER) {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    }
  }, [user, navigate]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  function onSubmit(data: FormData) {
    // Create account with jobseeker role
    const formattedData = {
      username: data.username,
      password: data.password,
      userType: USER_TYPES.JOBSEEKER,
      email: data.username,
    };

    console.log('Submitting jobseeker registration data:', formattedData);
    
    registerMutation.mutate(formattedData, {
      onSuccess: (data) => {
        console.log('Registration successful:', data);
        // After successful registration, redirect to contact details page
        navigate('/contact-details');
      },
      onError: (error) => {
        console.error('Registration error:', error);
      }
    });
  }

  return (
    <AuthLayout
      title={<>Create <span className="text-gradient font-extrabold">Jobseeker</span> Account</>}
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
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>
        <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
          Create an account to find your ideal job based on values alignment and organizational fit.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    autoComplete="email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Create a password" 
                      type={showPassword ? "text" : "password"} 
                      autoComplete="new-password" 
                      {...field} 
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Confirm your password" 
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex items-start">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="terms-agreement"
                  />
                </FormControl>
                <label 
                  htmlFor="terms-agreement" 
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the 
                  <Link href="/terms-of-service" target="_blank" className="text-primary hover:text-primary/80"> Terms of Service </Link>
                  and
                  <Link href="/privacy-policy" target="_blank" className="text-primary hover:text-primary/80"> Privacy Policy</Link>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full btn-gradient rounded-lg text-base font-medium py-3 shadow-md hover:shadow-lg transition-all"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}