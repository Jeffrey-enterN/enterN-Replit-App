import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { USER_TYPES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading, refetch } = useAuth();
  const [preferredRole, setPreferredRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a preferred role stored in localStorage
    const storedRole = localStorage.getItem("preferred_role");
    if (storedRole) {
      setPreferredRole(storedRole);
    }

    // If user already has a type set, redirect to appropriate dashboard
    if (user?.userType) {
      if (user.userType === USER_TYPES.JOBSEEKER) {
        navigate("/jobseeker/dashboard");
      } else if (user.userType === USER_TYPES.EMPLOYER) {
        navigate("/employer/dashboard");
      }
    }
  }, [user, navigate]);

  const selectUserType = async (userType: string) => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/user/set-role", { userType });
      // Clear the preferred role from localStorage
      localStorage.removeItem("preferred_role");
      // Refresh user data
      await refetch();
      
      // Redirect to appropriate dashboard
      if (userType === USER_TYPES.JOBSEEKER) {
        navigate("/jobseeker/dashboard");
      } else {
        navigate("/employer/dashboard");
      }
    } catch (error) {
      console.error("Error setting user role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user already has a type set, don't render the selection screen
  if (user?.userType) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container max-w-6xl py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to enterN</h1>
          <p className="text-muted-foreground mt-2">
            Please select your role to get started
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className={`cursor-pointer transition-all hover:shadow-md ${preferredRole === USER_TYPES.JOBSEEKER ? 'ring-2 ring-primary' : ''}`}
                onClick={() => !isSubmitting && selectUserType(USER_TYPES.JOBSEEKER)}>
            <CardHeader>
              <CardTitle>I'm a Job Seeker</CardTitle>
              <CardDescription>Looking for new career opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create your anonymized profile and match with employers based on your values, work style, and preferences.</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => selectUserType(USER_TYPES.JOBSEEKER)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue as Job Seeker
              </Button>
            </CardFooter>
          </Card>

          <Card className={`cursor-pointer transition-all hover:shadow-md ${preferredRole === USER_TYPES.EMPLOYER ? 'ring-2 ring-primary' : ''}`}
                onClick={() => !isSubmitting && selectUserType(USER_TYPES.EMPLOYER)}>
            <CardHeader>
              <CardTitle>I'm an Employer</CardTitle>
              <CardDescription>Recruiting talent for my organization</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create your company profile and find candidates that align with your organization's values and culture.</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => selectUserType(USER_TYPES.EMPLOYER)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue as Employer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}