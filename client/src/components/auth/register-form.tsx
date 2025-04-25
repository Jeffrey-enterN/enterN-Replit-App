import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES, UserType } from '@/lib/constants';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SocialAuthButtons from './social-auth-buttons';

// Basic schema for all users
const baseSchema = {
  username: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  userType: z.union([z.literal(USER_TYPES.JOBSEEKER), z.literal(USER_TYPES.EMPLOYER)]),
};

// Additional fields for jobseekers
const jobseekerSchema = {
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }).optional(),
};

// Additional fields for employers
const employerSchema = {
  companyName: z.string().min(1, { message: 'Company name is required' }).optional(),
};

// Combined schema with conditional fields based on user type
const formSchema = z.object(baseSchema)
  .extend(jobseekerSchema)
  .extend(employerSchema)
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
      userType: USER_TYPES.JOBSEEKER,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
    },
  });

  // Watch for changes to userType to conditionally validate fields
  const userType = form.watch('userType');

  // Reset irrelevant fields when user type changes
  useEffect(() => {
    if (userType === USER_TYPES.JOBSEEKER) {
      form.setValue('companyName', '');
    } else {
      form.setValue('firstName', '');
      form.setValue('lastName', '');
      form.setValue('phone', '');
    }
  }, [userType, form]);

  function onSubmit(data: FormData) {
    // Use the email as username for login
    const formattedData = {
      username: data.username,
      password: data.password,
      userType: data.userType,
      email: data.username, // Copy email for clarity in database
    };

    // Add user type specific fields
    if (data.userType === USER_TYPES.JOBSEEKER) {
      Object.assign(formattedData, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
    } else {
      Object.assign(formattedData, {
        companyName: data.companyName,
      });
    }

    console.log('Submitting registration data:', formattedData);
    
    registerMutation.mutate(formattedData, {
      onSuccess: (data) => {
        console.log('Registration successful:', data);
      },
      onError: (error) => {
        console.error('Registration error:', error);
      }
    });
  }

  return (
    <div>
      <div className="mt-8">
        <div className="flex justify-center space-x-6">
          <div className="flex flex-col items-center">
            <button
              type="button"
              className={`relative bg-white border-2 ${
                form.watch('userType') === USER_TYPES.JOBSEEKER 
                  ? 'border-primary' 
                  : 'border-gray-300'
              } rounded-lg p-4 flex flex-col items-center space-y-2 hover:bg-primary-50 focus:outline-none`}
              onClick={() => form.setValue('userType', USER_TYPES.JOBSEEKER)}
            >
              <svg className={`w-10 h-10 ${form.watch('userType') === USER_TYPES.JOBSEEKER ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="font-medium text-gray-900">Jobseeker</span>
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <button
              type="button"
              className={`relative bg-white border-2 ${
                form.watch('userType') === USER_TYPES.EMPLOYER 
                  ? 'border-primary' 
                  : 'border-gray-300'
              } rounded-lg p-4 flex flex-col items-center space-y-2 hover:bg-primary-50 focus:outline-none`}
              onClick={() => form.setValue('userType', USER_TYPES.EMPLOYER)}
            >
              <svg className={`w-10 h-10 ${form.watch('userType') === USER_TYPES.EMPLOYER ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span className="font-medium text-gray-900">Employer</span>
            </button>
          </div>
        </div>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">
              Sign up with
            </span>
          </div>
        </div>

        <SocialAuthButtons />

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email address" 
                    type="email" 
                    autoComplete="email" 
                    {...field} 
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
                <FormLabel className="sr-only">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Password" 
                      type={showPassword ? "text" : "password"} 
                      autoComplete="new-password" 
                      {...field} 
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
                <FormLabel className="sr-only">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Confirm password" 
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password" 
                      {...field} 
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional fields based on user type */}
          {userType === USER_TYPES.JOBSEEKER && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First name" 
                          autoComplete="given-name" 
                          {...field} 
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Last name" 
                          autoComplete="family-name" 
                          {...field} 
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Phone number" 
                        type="tel"
                        autoComplete="tel" 
                        {...field} 
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {userType === USER_TYPES.EMPLOYER && (
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Company Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Company name" 
                      autoComplete="organization" 
                      {...field} 
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the 
                  <a href="#" className="text-primary hover:text-primary/80"> Terms of Service </a>
                  and
                  <a href="#" className="text-primary hover:text-primary/80"> Privacy Policy</a>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
