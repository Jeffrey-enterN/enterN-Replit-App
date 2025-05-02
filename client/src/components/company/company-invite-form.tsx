import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema for invite form
const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.string().default('recruiter'),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface CompanyInviteFormProps {
  companyId: number;
}

export default function CompanyInviteForm({ companyId }: CompanyInviteFormProps) {
  const { toast } = useToast();
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'recruiter',
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteFormValues) => {
      const response = await apiRequest('POST', '/api/employer/company/invite', {
        ...values,
        companyId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Sent',
        description: 'Your teammate has been invited to join your company',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company/invites'] });
      setIsFormVisible(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: InviteFormValues) {
    inviteMutation.mutate(values);
  }

  return (
    <div className="space-y-4">
      {!isFormVisible ? (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setIsFormVisible(true)}
            className="w-full sm:w-auto"
          >
            + Invite a Team Member
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="colleague@company.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your colleague's work email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the user's role in your company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}