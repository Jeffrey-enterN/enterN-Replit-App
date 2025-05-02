import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
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
import EmployerProfilePage from "@/pages/employer/profile-page";
import CompanyProfilePage from "@/pages/employer/company-profile-page";
import JobseekerMatchFeed from "@/pages/jobseeker/match-feed";
import JobseekerCalendar from "@/pages/jobseeker/calendar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <ProtectedRoute path="/contact-details" component={ContactDetailsPage} />
      <ProtectedRoute path="/jobseeker/dashboard" component={JobseekerDashboard} />
      <ProtectedRoute path="/jobseeker/profile" component={JobseekerProfilePage} />
      <ProtectedRoute path="/jobseeker/match-feed" component={JobseekerMatchFeed} />
      <ProtectedRoute path="/jobseeker/calendar" component={JobseekerCalendar} />
      <ProtectedRoute 
        path="/employer/dashboard" 
        component={() => (
          <EmployerLayout>
            <EmployerDashboard />
          </EmployerLayout>
        )} 
      />
      <ProtectedRoute 
        path="/employer/profile" 
        component={() => (
          <EmployerLayout>
            <EmployerProfilePage />
          </EmployerLayout>
        )} 
      />
      <ProtectedRoute 
        path="/employer/company-profile" 
        component={() => (
          <EmployerLayout>
            <CompanyProfilePage />
          </EmployerLayout>
        )} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <NotificationSettingsProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </NotificationSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
