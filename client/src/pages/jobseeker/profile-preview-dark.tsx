import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import JobseekerNavbar from "@/components/layouts/jobseeker-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { USER_TYPES, SLIDER_CATEGORIES } from "@/lib/constants";

export default function JobseekerProfilePreview() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("employer-view");

  // Redirect if not logged in or not a jobseeker
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.userType !== USER_TYPES.JOBSEEKER) {
    return <Redirect to="/employer/dashboard" />;
  }

  // Fetch jobseeker profile
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/jobseeker/profile"],
    staleTime: 60000,
  });

  // Determine completion status
  const hasBasicInfo = profile && profile.firstName && profile.lastName && profile.phone;
  const hasEducation = profile && profile.school && profile.major && profile.degreeLevel;
  const hasWorkPreferences = profile && profile.workArrangements && profile.workArrangements.length > 0;
  
  // Calculate which slider categories are complete (5 or more sliders in a category)
  const completedCategories = profile?.sliderValues 
    ? SLIDER_CATEGORIES.filter(category => {
        const completedSliders = category.sliders
          .filter(slider => profile.sliderValues[slider.id] !== undefined)
          .length;
        return completedSliders >= 5;
      })
    : [];
    
  const completedSliderSections = completedCategories.length;
  
  // Count total sliders completed
  const totalSliderCount = profile?.sliderValues
    ? Object.keys(profile.sliderValues).length
    : 0;
  
  // Profile is complete if:
  // 1. Has basic info
  // 2. Has education info
  // 3. Has work preferences
  // 4. Has at least 3 completed slider categories (5+ sliders in each)
  const isProfileComplete = hasBasicInfo && hasEducation && hasWorkPreferences && completedSliderSections >= 3;

  return (
    <>
      <JobseekerNavbar />
      <DashboardLayout title="Profile Preview">
        <div className="container mx-auto max-w-5xl mb-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/jobseeker/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold">Profile Preview</h2>
          </div>
          
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Preview Mode</AlertTitle>
            <AlertDescription>
              This page shows how employers will see your profile in the matching process. Your personal information (name, email, phone, etc.) will not be visible to employers until you match with them.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="employer-view" className="mb-8" onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employer-view">
                <Eye className="h-4 w-4 mr-2" />
                Employer View
              </TabsTrigger>
              <TabsTrigger value="your-view">
                <Shield className="h-4 w-4 mr-2" />
                Your Complete Profile
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="employer-view" className="space-y-4 pt-4">
              {isLoading ? (
                <ProfileSkeleton />
              ) : !profile ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Profile Found</CardTitle>
                    <CardDescription>
                      You haven't created a profile yet. Go to the Profile page to create one.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate('/jobseeker/profile')}>
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Anonymous Jobseeker</CardTitle>
                          <CardDescription>Early Career Professional</CardDescription>
                        </div>
                        {isProfileComplete ? (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30">
                            Profile Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                            Profile Incomplete
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hasEducation && (
                          <div>
                            <h3 className="font-medium text-sm">Education</h3>
                            <p className="text-sm text-muted-foreground">{profile.degreeLevel} in {profile.major}</p>
                            <p className="text-sm text-muted-foreground">University/School Name Hidden</p>
                          </div>
                        )}
                        
                        {hasWorkPreferences && (
                          <div>
                            <h3 className="font-medium text-sm">Work Preferences</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {profile.workArrangements.map((arrangement: string) => (
                                <Badge key={arrangement} variant="secondary">
                                  {arrangement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {!hasEducation && !hasWorkPreferences && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800/30">
                            <p className="text-amber-800 dark:text-amber-200 text-sm">
                              Your basic profile information is incomplete. Employers can see that your profile exists, 
                              but without education and work preferences, you may receive fewer match opportunities.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preference Profile</CardTitle>
                      <CardDescription>
                        Employers see your preference profile to determine potential fit
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.sliderValues && Object.keys(profile.sliderValues).length > 0 ? (
                        <div className="space-y-6">
                          {SLIDER_CATEGORIES.map((category, categoryIndex) => {
                            // Get all slider keys that belong to this category
                            const categorySliders = category.sliders
                              .map(slider => slider.id)
                              .filter(id => profile.sliderValues && profile.sliderValues[id] !== undefined);
                            
                            // Skip categories with no values
                            if (categorySliders.length === 0) return null;
                            
                            return (
                              <div key={category.id} className="space-y-2">
                                <h3 className="font-medium">
                                  {category.name}
                                  {categorySliders.length >= 5 && (
                                    <Badge variant="outline" className="ml-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                      Complete
                                    </Badge>
                                  )}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {categorySliders.slice(0, 4).map(sliderId => {
                                    // Find the slider definition to get the proper name
                                    const sliderDef = category.sliders.find(s => s.id === sliderId);
                                    return (
                                      <div key={sliderId} className="flex items-center justify-between">
                                        <span className="text-sm capitalize">{sliderDef?.name || sliderId.replace(/_/g, ' ')}</span>
                                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-primary"
                                            style={{ width: `${profile.sliderValues[sliderId]}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {categorySliders.length > 4 && (
                                    <div className="text-sm text-muted-foreground md:col-span-2">
                                      + {categorySliders.length - 4} more preferences in this category
                                    </div>
                                  )}
                                </div>
                                {categoryIndex < SLIDER_CATEGORIES.length - 1 && <Separator className="my-4" />}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded border border-amber-200 dark:border-amber-800/30">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-amber-800 dark:text-amber-200">No preference data found</h3>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                You haven't set your preferences yet. Employers use these values to determine potential 
                                fit with their organization. We recommend completing at least 3 preference categories.
                              </p>
                              <Button 
                                className="mt-3" 
                                size="sm"
                                onClick={() => navigate('/jobseeker/profile')}
                              >
                                Update Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hidden Information</CardTitle>
                      <CardDescription>
                        This information is only revealed to employers after a mutual match
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">Name</h3>
                            <div className="flex items-center mt-1">
                              <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="h-4 w-28 bg-muted rounded" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Email</h3>
                            <div className="flex items-center mt-1">
                              <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="h-4 w-32 bg-muted rounded" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Phone</h3>
                            <div className="flex items-center mt-1">
                              <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="h-4 w-24 bg-muted rounded" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">School</h3>
                            <div className="flex items-center mt-1">
                              <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="h-4 w-28 bg-muted rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="your-view" className="pt-4">
              {isLoading ? (
                <ProfileSkeleton />
              ) : !profile ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Profile Found</CardTitle>
                    <CardDescription>
                      You haven't created a profile yet. Go to the Profile page to create one.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate('/jobseeker/profile')}>
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {profile.firstName && profile.lastName
                              ? `${profile.firstName} ${profile.lastName}`
                              : "Your Profile"}
                          </CardTitle>
                          <CardDescription>
                            Completion Status: {isProfileComplete ? "Complete" : "Incomplete"}
                          </CardDescription>
                        </div>
                        {isProfileComplete ? (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30">
                            Profile Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                            Profile Incomplete
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-sm">Contact Information</h3>
                            <div className="space-y-1 mt-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Email:</span>{" "}
                                {profile.email || "Not provided"}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Phone:</span>{" "}
                                {profile.phone || "Not provided"}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-sm">Education</h3>
                            <div className="space-y-1 mt-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">School:</span>{" "}
                                {profile.school || "Not provided"}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Degree:</span>{" "}
                                {profile.degreeLevel || "Not provided"} in {profile.major || "Not provided"}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                {profile.isStudent ? "Current Student" : "Graduate"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {profile.workArrangements && profile.workArrangements.length > 0 && (
                          <div>
                            <h3 className="font-medium text-sm">Work Preferences</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {profile.workArrangements.map((arrangement: string) => (
                                <Badge key={arrangement} variant="secondary">
                                  {arrangement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(!hasEducation || !hasWorkPreferences) && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800/30">
                            <p className="text-amber-800 dark:text-amber-200 text-sm">
                              Your profile is missing key information. To become visible to potential employers, 
                              please complete your {!hasEducation && "education"}{!hasEducation && !hasWorkPreferences && " and "}
                              {!hasWorkPreferences && "work preferences"}.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => navigate('/jobseeker/profile')}
                            >
                              Complete Profile
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Preference Profile Status</CardTitle>
                      <CardDescription>
                        Completion Progress: {completedSliderSections} of 9 sections completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.sliderValues && Object.keys(profile.sliderValues).length > 0 ? (
                        <div className="space-y-4">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(100, (completedSliderSections / 3) * 100)}%` }}
                            />
                          </div>
                          
                          <p className="text-sm">
                            {completedSliderSections >= 3 
                              ? `You've completed ${completedSliderSections} slider sections with ${totalSliderCount} total preferences set. This meets the minimum requirement!` 
                              : `You need to complete at least 3 slider sections. Currently, you've completed ${completedSliderSections}.`
                            }
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {SLIDER_CATEGORIES.map((category) => {
                              const categorySliders = category.sliders
                                .map(slider => slider.id)
                                .filter(id => profile.sliderValues && profile.sliderValues[id] !== undefined);
                              const isComplete = categorySliders.length >= 5;
                              
                              return (
                                <div 
                                  key={category.id} 
                                  className={`border rounded-md p-3 ${isComplete ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{category.name}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${isComplete ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:text-amber-300'}`}
                                    >
                                      {categorySliders.length}/5
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {completedSliderSections < 3 && (
                            <Button
                              onClick={() => navigate('/jobseeker/profile')}
                              className="mt-2"
                            >
                              Complete Preferences
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded border border-amber-200 dark:border-amber-800/30">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-amber-800 dark:text-amber-200">No preference data found</h3>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                You haven't set your preferences yet. These values are critical for matching with 
                                potential employers. We recommend completing at least 3 preference categories.
                              </p>
                              <Button 
                                className="mt-3" 
                                size="sm"
                                onClick={() => navigate('/jobseeker/profile')}
                              >
                                Set Preferences
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}