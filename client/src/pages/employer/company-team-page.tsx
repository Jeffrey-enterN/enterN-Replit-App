import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import EmployerLayout from "@/components/layouts/employer-layout";
import CompanyTeamPanel from "@/components/company/company-team-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CompanyTeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if user is authenticated and has a company
  if (!user) {
    return (
      <EmployerLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </EmployerLayout>
    );
  }
  
  if (!user.companyId) {
    return (
      <EmployerLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Alert>
            <AlertTitle>Company Required</AlertTitle>
            <AlertDescription>
              You need to create or join a company before accessing team management.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/employer/company-profile">
              <Button>Create Company Profile</Button>
            </Link>
          </div>
        </div>
      </EmployerLayout>
    );
  }
  
  // Check if user is an admin or owner
  const isAdmin = user.companyRole === 'admin' || user.companyRole === 'owner';
  
  return (
    <EmployerLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Team</h1>
            <p className="text-muted-foreground mt-1">
              Manage your company team members and permissions
            </p>
          </div>
          <Users className="h-10 w-10 text-primary/20" />
        </div>
        
        <div className="grid gap-6">
          {/* Team management section */}
          {user.companyId ? (
            <CompanyTeamPanel 
              companyId={user.companyId} 
              userId={user.id} 
              isAdmin={isAdmin}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading team data...</p>
              </CardContent>
            </Card>
          )}
          
          {/* Role information card */}
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Understanding permissions within your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Owner</h3>
                  <p className="text-sm text-muted-foreground">
                    Full control over the company account, including billing, deleting the account, and all admin privileges.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Admin</h3>
                  <p className="text-sm text-muted-foreground">
                    Can manage team members, update company profile, create job postings, and manage matches.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Hiring Manager</h3>
                  <p className="text-sm text-muted-foreground">
                    Can view and interact with potential matches, but cannot edit company settings or invite team members.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Recruiter</h3>
                  <p className="text-sm text-muted-foreground">
                    Standard access to view and engage with potential candidates in the matching system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  );
}