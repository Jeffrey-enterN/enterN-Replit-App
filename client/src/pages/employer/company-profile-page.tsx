import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CompanyProfileForm } from '@/components/company/company-profile-form';
import { Loader2, Building, InfoIcon } from 'lucide-react';

export default function CompanyProfilePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  
  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    } else if (!isLoading && user && user.userType !== 'employer') {
      setLocation('/');
    }
    
    // Set company ID if the user already belongs to one
    if (user?.companyId) {
      setCompanyId(user.companyId);
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8 text-center">
        <Building className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Create Your Company Profile</h1>
        <p className="text-muted-foreground max-w-2xl">
          Complete your company profile to help us match you with the best talent. 
          This information will be used to create a compelling company profile that attracts candidates.
        </p>
      </div>
      
      <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4 flex items-start">
          <InfoIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-700">Quick and Easy Setup</h3>
            <p className="text-sm text-blue-600">
              We've made it simple to create your company profile by adding a website scraper feature.
              Just enter your careers page URL, and we'll automatically extract information about your company.
              You can then review and edit this information before submission.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <CompanyProfileForm companyId={companyId} />
    </div>
  );
}