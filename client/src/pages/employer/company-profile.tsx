import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/components/layouts/dashboard-layout';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMPANY_SIZES, INDUSTRIES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, PlusCircle, UserPlus, Building } from 'lucide-react';
import CompanyInviteForm from '@/components/company/company-invite-form';
import CompanyTeamList from '@/components/company/company-team-list';

// Company profile schema
const companyProfileSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  headquarters: z.string().optional(),
  yearFounded: z.string().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
  about: z.string().optional(),
  mission: z.string().optional(),
  values: z.string().optional(),
  additionalOffices: z.string().optional(),
  additionalBenefits: z.string().optional(),
  benefits: z.array(z.string()).optional(),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch company profile
  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['/api/employer/company'],
    enabled: !!user && user.companyId !== null,
  });

  // Fetch company teammates 
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['/api/employer/company/team'],
    enabled: !!user && user.companyId !== null,
  });

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: '',
      website: '',
      headquarters: '',
      yearFounded: '',
      size: '',
      industry: '',
      about: '',
      mission: '',
      values: '',
      additionalOffices: '',
      additionalBenefits: '',
      benefits: [],
    },
  });

  // Update form when company data loads
  if (companyData && !form.formState.isDirty) {
    form.reset({
      name: companyData.name || '',
      website: companyData.website || '',
      headquarters: companyData.headquarters || '',
      yearFounded: companyData.yearFounded?.toString() || '',
      size: companyData.size || '',
      industry: companyData.industry || '',
      about: companyData.about || '',
      mission: companyData.mission || '',
      values: companyData.values || '',
      additionalOffices: companyData.additionalOffices?.join(', ') || '',
      additionalBenefits: companyData.additionalBenefits || '',
      benefits: companyData.benefits || [],
    });
  }

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyProfileFormValues) => {
      // Convert additionalOffices from comma-separated string to array
      const formattedData = {
        ...data,
        yearFounded: data.yearFounded ? parseInt(data.yearFounded, 10) : undefined,
        additionalOffices: data.additionalOffices
          ? data.additionalOffices.split(',').map(office => office.trim())
          : []
      };
      
      const response = await apiRequest(
        'PUT',
        '/api/employer/company',
        formattedData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Company profile updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyProfileFormValues) => {
      // Convert additionalOffices from comma-separated string to array
      const formattedData = {
        ...data,
        yearFounded: data.yearFounded ? parseInt(data.yearFounded, 10) : undefined,
        additionalOffices: data.additionalOffices
          ? data.additionalOffices.split(',').map(office => office.trim())
          : []
      };
      
      const response = await apiRequest(
        'POST',
        '/api/employer/company',
        formattedData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Company profile created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CompanyProfileFormValues) => {
    if (user?.companyId) {
      updateCompanyMutation.mutate(data);
    } else {
      createCompanyMutation.mutate(data);
    }
  };

  const isSubmitting = updateCompanyMutation.isPending || createCompanyMutation.isPending;

  return (
    <DashboardLayout 
      title="Company Profile" 
      subtitle="Manage your company information and team members"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className="flex items-center gap-2"
            disabled={!user?.companyId}
          >
            <UserPlus className="h-4 w-4" />
            Team Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {isCompanyLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Provide the basic details about your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://www.example.com" />
                            </FormControl>
                            <FormDescription>
                              Include the full URL with https://
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="headquarters"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headquarters</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City, State/Country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COMPANY_SIZES.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="yearFounded"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Founded</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="YYYY" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDUSTRIES.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalOffices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Office Locations</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="New York, London, Tokyo" />
                          </FormControl>
                          <FormDescription>
                            Enter locations separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Description & Culture</CardTitle>
                    <CardDescription>
                      Help candidates understand your company's mission and values
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About the Company</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Tell us about your company, its purpose, and what you do."
                              className="min-h-[120px] resize-y"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Mission</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What is your company's mission? Why does your company exist?"
                              className="min-h-[100px] resize-y"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="values"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Values</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What are your company's core values? What principles guide your work?"
                              className="min-h-[100px] resize-y"
                            />
                          </FormControl>
                          <FormDescription>
                            List the core values that define your company culture
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalBenefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Benefits</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What benefits do you offer? (Health insurance, remote work options, professional development, etc.)"
                              className="min-h-[100px] resize-y"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        // Only enable preview if form is valid
                        if (Object.keys(form.formState.errors).length === 0) {
                          // Store form data in sessionStorage for preview
                          const formData = form.getValues();
                          sessionStorage.setItem('company_profile_preview', JSON.stringify(formData));
                          // Open preview in new tab
                          window.open('/employer/company-profile/preview', '_blank');
                        } else {
                          toast({
                            title: "Form has errors",
                            description: "Please correct all errors before previewing.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Preview in Match Feed
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {user?.companyId ? 'Update Company Profile' : 'Create Company Profile'}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-8">
          {!user?.companyId ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-6">
                  <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">Create a Company Profile First</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You need to create a company profile before you can manage team members.
                  </p>
                  <Button
                    onClick={() => setActiveTab('profile')}
                    variant="outline" 
                    className="mt-4"
                  >
                    Go to Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isTeamLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage the recruiters and team members with access to your company account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyTeamList teamMembers={teamData?.team || []} currentUserId={user?.id} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Members</CardTitle>
                  <CardDescription>
                    Invite colleagues to join your company's enterN account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyInviteForm companyId={user.companyId} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}