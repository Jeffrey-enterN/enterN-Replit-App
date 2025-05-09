import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { lazy } from "react";

import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { ProtectedRoute } from "@/lib/protected-route";
import EmployerLayout from "@/components/layouts/employer-layout";

import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import SignInPage from "@/pages/sign-in-page";
import SignUpPage from "@/pages/sign-up-page";
import ContactDetailsPage from "@/pages/contact-details-page";
import JobseekerDashboard from "@/pages/jobseeker/dashboard";
import EmployerDashboard from "@/pages/employer/dashboard";
import JobseekerProfilePage from "@/pages/jobseeker/profile-page";
// Employer profile page removed to avoid duplication
import CompanyProfilePage from "@/pages/employer/company-profile-page";
import CompanyTeamPage from "@/pages/employer/company-team-page";
import EmployerMatchFeed from "@/pages/employer/match-feed";
import JobseekerMatchFeed from "@/pages/jobseeker/match-feed";
import JobsFeed from "@/pages/jobseeker/jobs-feed";
import JobseekerCalendar from "@/pages/jobseeker/calendar";
import JobseekerProfilePreview from "@/pages/jobseeker/profile-preview";
import JobseekerSignUpPage from "@/pages/jobseeker/sign-up-page";
import EmployerSignUpPage from "@/pages/employer/sign-up-page";
import CompanyProfilePreview from "@/pages/employer/company-profile-preview";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import SupportPage from "@/pages/support";
import JobsPage from "@/pages/employer/jobs";
import NewJobPage from "@/pages/employer/jobs/new";
import SliderPreferencesPage from "@/pages/employer/slider-preferences-page";
import NotFound from "@/pages/not-found";

// Lazy-loaded admin pages
const DatabaseOperationsPage = lazy(() => import("@/pages/admin/database-operations"));
const JobsViewPage = lazy(() => import("@/pages/admin/jobs-view"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up/jobseeker" component={JobseekerSignUpPage} />
      <Route path="/sign-up/employer" component={EmployerSignUpPage} />
      <Route path="/sign-up" component={SignUpPage} />
      {/* Add these routes to handle direct access to sign-up paths */}
      <Route path="/sign-up-jobseeker" component={JobseekerSignUpPage} />
      <Route path="/sign-up-employer" component={EmployerSignUpPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/support" component={SupportPage} />
      <ProtectedRoute path="/contact-details" component={ContactDetailsPage} />
      <ProtectedRoute path="/jobseeker/dashboard" component={JobseekerDashboard} />
      <ProtectedRoute path="/jobseeker/profile" component={JobseekerProfilePage} />
      <ProtectedRoute path="/jobseeker/profile-preview" component={JobseekerProfilePreview} />
      <ProtectedRoute path="/jobseeker/match-feed" component={JobseekerMatchFeed} />
      <ProtectedRoute path="/jobseeker/jobs-feed" component={JobsFeed} />
      <ProtectedRoute path="/jobseeker/calendar" component={JobseekerCalendar} />
      <Route path="/employer/dashboard">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/dashboard" 
            component={EmployerDashboard} 
          />
        </EmployerLayout>
      </Route>
      {/* Employer profile route removed to avoid duplication */}
      <Route path="/employer/company-profile">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/company-profile" 
            component={CompanyProfilePage}
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/company-team">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/company-team" 
            component={CompanyTeamPage}
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/match-feed">
        <ProtectedRoute 
          path="/employer/match-feed" 
          component={EmployerMatchFeed}
        />
      </Route>
      <Route path="/employer/company-profile/preview">
        <ProtectedRoute 
          path="/employer/company-profile/preview" 
          component={CompanyProfilePreview}
        />
      </Route>
      <Route path="/employer/jobs">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/jobs" 
            component={JobsPage}
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/jobs/new">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/jobs/new" 
            component={NewJobPage}
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/slider-preferences">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/slider-preferences" 
            component={SliderPreferencesPage}
          />
        </EmployerLayout>
      </Route>
      {/* Admin routes - direct access without ProtectedRoute */}
      <Route path="/admin/database-operations" component={DatabaseOperationsPage} />
      <Route path="/admin/jobs" component={JobsViewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationSettingsProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </NotificationSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
