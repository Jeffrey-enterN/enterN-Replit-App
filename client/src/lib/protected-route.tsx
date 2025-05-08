import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { USER_TYPES } from "@/lib/constants";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const isJobseekerRoute = path.startsWith("/jobseeker");
  const isEmployerRoute = path.startsWith("/employer");

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Special case for admin routes - they're accessible to all authenticated users
  const isAdminRoute = path.startsWith("/admin");
  
  // Skip type checking for admin routes
  if (!isAdminRoute) {
    // Check if the user type matches the route
    if (
      (isJobseekerRoute && user.userType !== USER_TYPES.JOBSEEKER) ||
      (isEmployerRoute && user.userType !== USER_TYPES.EMPLOYER)
    ) {
      return (
        <Route path={path}>
          <Redirect to={user.userType === USER_TYPES.JOBSEEKER ? "/jobseeker/dashboard" : "/employer/dashboard"} />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
}
