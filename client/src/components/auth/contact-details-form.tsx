import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query'; 
import { useLocation } from 'wouter';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { USER_TYPES } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';
import { apiRequest } from '@/lib/queryClient';

// Define different schemas for jobseeker and employer
const jobseekerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

const employerSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  contactName: z.string().min(1, { message: 'Contact name is required' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

type JobseekerFormData = z.infer<typeof jobseekerSchema>;
type EmployerFormData = z.infer<typeof employerSchema>;

export default function ContactDetailsForm() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Determine which schema to use based on user type
  const isJobseeker = user?.userType === USER_TYPES.JOBSEEKER;
  const formSchema = isJobseeker ? jobseekerSchema : employerSchema;
  
  // Union type for form data based on user type
  type FormData = JobseekerFormData | EmployerFormData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      ...(isJobseeker 
        ? { firstName: '', lastName: '', phone: '' } 
        : { companyName: '', contactName: '', phone: '' }),
    } as any,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest('POST', '/api/user/profile', data);
      return await res.json();
    },
    onSuccess: () => {
      // Navigate to the appropriate dashboard
      setLocation(isJobseeker ? '/jobseeker/dashboard' : '/employer/dashboard');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });

  function onSubmit(data: FormData) {
    updateProfileMutation.mutate(data);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Let's make sure we can stay in touch</h2>
        <p className="text-gray-600 mt-2">
          Please provide your contact details so we can keep you updated
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isJobseeker ? (
            // Jobseeker fields
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your first name" 
                          {...field} 
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your last name" 
                          {...field} 
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your phone number" 
                        type="tel"
                        {...field} 
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            // Employer fields
            <>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your company name" 
                        {...field} 
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your phone number" 
                        type="tel"
                        {...field} 
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}