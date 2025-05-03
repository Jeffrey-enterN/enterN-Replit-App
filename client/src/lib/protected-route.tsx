import { useAuth } from "../context/auth-context";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  role?: string;
};

export function ProtectedRoute({
  path,
  component: Component,
  role
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !isAuthenticated ? (
        <Redirect to="/auth" />
      ) : role && user?.userType !== role ? (
        <Redirect to="/unauthorized" />
      ) : (
        <Component />
      )}
    </Route>
  );
}