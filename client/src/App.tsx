import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NotificationSettingsProvider } from "@/context/notification-settings-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/lib/protected-route";
import EmployerLayout from "@/components/layouts/employer-layout";

import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import UnauthorizedPage from "@/pages/unauthorized-page";
import ContactDetailsPage from "@/pages/contact-details-page";
import OnboardingPage from "@/pages/onboarding-page";
import JobseekerDashboard from "@/pages/jobseeker/dashboard";
import EmployerDashboard from "@/pages/employer/dashboard";
import JobseekerProfilePage from "@/pages/jobseeker/profile-page";
import CompanyProfilePage from "@/pages/employer/company-profile-page";
import CompanyTeamPage from "@/pages/employer/company-team-page";
import EmployerMatchFeed from "@/pages/employer/match-feed";
import JobseekerMatchFeed from "@/pages/jobseeker/match-feed";
import JobseekerCalendar from "@/pages/jobseeker/calendar";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/contact-details" component={ContactDetailsPage} />
      <ProtectedRoute path="/jobseeker/dashboard" component={JobseekerDashboard} role="jobseeker" />
      <ProtectedRoute path="/jobseeker/profile" component={JobseekerProfilePage} role="jobseeker" />
      <ProtectedRoute path="/jobseeker/match-feed" component={JobseekerMatchFeed} role="jobseeker" />
      <ProtectedRoute path="/jobseeker/calendar" component={JobseekerCalendar} role="jobseeker" />
      <Route path="/employer/dashboard">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/dashboard" 
            component={EmployerDashboard}
            role="employer"
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/company-profile">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/company-profile" 
            component={CompanyProfilePage}
            role="employer"
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/company-team">
        <EmployerLayout>
          <ProtectedRoute 
            path="/employer/company-team" 
            component={CompanyTeamPage}
            role="employer"
          />
        </EmployerLayout>
      </Route>
      <Route path="/employer/match-feed">
        <ProtectedRoute 
          path="/employer/match-feed" 
          component={EmployerMatchFeed}
          role="employer"
        />
      </Route>
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
