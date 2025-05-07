import { useAuth } from "@/context/auth-context";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Clock, Mail, PenLine } from "lucide-react";

// Last updated timestamp
const LAST_UPDATED = "May 6, 2025";

export default function SupportPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <DashboardLayout title="Support Center">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Support Center</h1>
            <p className="text-muted-foreground">
              Get help with your enterN account and features
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
              <CardDescription>Contact our support team directly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@enter-n.com" className="text-primary hover:underline">
                  info@enter-n.com
                </a>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "mailto:info@enter-n.com"}>
                Send Email
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Feature Requests</CardTitle>
              <CardDescription>Have an idea for improving enterN?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                We're constantly working to improve the platform based on your feedback. Let us know what features would help you most.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "mailto:info@enter-n.com?subject=Feature Request"}>
                <PenLine className="h-4 w-4 mr-2" />
                Submit Feature Request
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Schedule a Demo</CardTitle>
              <CardDescription>Learn how to get the most from enterN</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                New to enterN? Schedule a 15-minute walkthrough with our team to understand how to maximize your experience.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => window.location.href = "https://calendly.com/entern/demo"}>
                Book a Demo
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does enterN's matching algorithm work?</AccordionTrigger>
              <AccordionContent>
                enterN uses a sophisticated preference-based matching system that analyzes both jobseeker and employer preferences across multiple dimensions. The system considers factors like organizational values, work style, leadership preferences, and more to create meaningful connections beyond just skills and experience. The more slider preferences you complete, the more accurate your matches will be.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>When will employers see my personal information?</AccordionTrigger>
              <AccordionContent>
                Your privacy is important to us. Employers will only see your name, contact information, school, and major after a mutual match occurs (when both you and the employer have expressed interest in each other). Before a match, employers see an anonymized version of your profile focused on your preferences and qualifications.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What happens after I match with an employer?</AccordionTrigger>
              <AccordionContent>
                Once a mutual match occurs, both parties will receive a notification. The employer will gain access to your contact information, and you'll be able to see more details about the company and position. From there, the employer will typically reach out to schedule an interview or provide next steps in their hiring process.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I update my profile preferences?</AccordionTrigger>
              <AccordionContent>
                You can update your profile preferences at any time by navigating to the Profile section from your dashboard. Adjust the sliders in each category to reflect your current preferences. Remember that you need to complete at least three slider sections (15+ total sliders) for your profile to be considered complete and visible to potential matches.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How can I preview how employers see my profile?</AccordionTrigger>
              <AccordionContent>
                You can preview how your profile appears to employers by visiting your Dashboard and clicking on "Preview Profile" in the Profile section. This shows you exactly how employers will see your anonymized profile in the matching process, helping you understand what information is visible before a mutual match.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-base">May 6, 2025</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Added profile preview feature to Dashboard for better visibility</li>
                <li>Enhanced swipe mechanism to prevent duplicate matches</li>
                <li>Improved match handling with better company information</li>
                <li>Updated match feed UI for more intuitive interactions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-base">April 29, 2025</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Enhanced job posting functionality with zip code lookup</li>
                <li>Added support for remote positions in job listings</li>
                <li>Implemented preferred majors field for better targeting</li>
                <li>Added URL scraping for job descriptions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-base">April 22, 2025</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Launched BooBase resource integration</li>
                <li>Redesigned match card interface for better experience</li>
                <li>Fixed employer dashboard analytics</li>
                <li>Updated slider categories to final version</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}