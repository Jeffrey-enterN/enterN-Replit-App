import React, { useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/layouts/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import enternLogo from '@/assets/entern-logo.png';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function SupportPage() {
  // Function to copy email to clipboard with toast notification
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('info@enter-n.com');
    toast({
      title: "Email copied to clipboard",
      description: "You can now paste it into your email client.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Global Navbar */}
      <Navbar />

      {/* Support Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Support Information */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gradient">Contact Support</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  Have a question or need help? We're here for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg border border-blue-100 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 flex items-center mb-3">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Report an Issue
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      If you encounter any bugs, technical issues, or have suggestions for improving the platform, please email us directly at:
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                      <p className="font-medium text-blue-600 dark:text-blue-400">info@enter-n.com</p>
                      <Button 
                        variant="outline" 
                        onClick={copyEmailToClipboard}
                        className="text-sm"
                      >
                        Copy Email
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">When contacting support, please include:</h3>
                    <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>A detailed description of the issue or suggestion</li>
                      <li>Steps to reproduce the problem (if applicable)</li>
                      <li>What browser and device you're using</li>
                      <li>Screenshots or screen recordings (if possible)</li>
                      <li>Your account information (username/email)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-3">
                      <Clock className="h-5 w-5 mr-2" />
                      Response Time
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Our team typically responds to all inquiries within 24-48 hours during business days. For urgent matters, please indicate this in your email subject line.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - FAQs, Update Log, and Support Info */}
          <div className="lg:col-span-5">
            <Card className="shadow-lg bg-white dark:bg-gray-800 mb-8">
              <CardHeader className="pb-2">
                <Tabs defaultValue="faq" className="w-full">
                  <TabsList className="w-full mb-2">
                    <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
                    <TabsTrigger value="updates" className="flex-1">Update Log</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="faq">
                    <CardTitle className="text-2xl font-bold mb-2">Frequently Asked Questions</CardTitle>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          What is enterN?
                        </AccordionTrigger>
                        <AccordionContent>
                          enterN is a sophisticated AI-powered talent matching platform that revolutionizes professional 
                          networking through intelligent, multi-dimensional profiling and engaging user experiences. We focus 
                          on matching early-career professionals with employers based on organizational fit, work preferences, 
                          and values, not just skills and experience.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          How does the matching system work?
                        </AccordionTrigger>
                        <AccordionContent>
                          Our platform uses a two-way matching algorithm where both jobseekers and employers express interest 
                          independently. Only when there's mutual interest does a match occur. This is powered by our 
                          proprietary slider system that captures 45 data points across 9 categories to evaluate organizational fit.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          Is my data safe and secure?
                        </AccordionTrigger>
                        <AccordionContent>
                          Yes! We take data security very seriously. All data is encrypted both in transit and at rest. 
                          We never sell your personal information, and we're transparent about how your data is used. 
                          For more details, please review our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-4">
                        <AccordionTrigger>
                          How do I delete my account?
                        </AccordionTrigger>
                        <AccordionContent>
                          You can delete your account at any time through your profile settings. Alternatively, 
                          you can email us at info@enter-n.com with a deletion request, and we'll process it promptly.
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="item-5">
                        <AccordionTrigger>
                          I'm experiencing a technical issue. What should I do?
                        </AccordionTrigger>
                        <AccordionContent>
                          Please email info@enter-n.com to report any technical issues. Include as much detail as possible, 
                          including what device and browser you're using, and steps to reproduce the problem. Our technical team 
                          will investigate promptly.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="updates">
                    <CardTitle className="text-2xl font-bold mb-2">Latest Updates</CardTitle>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          <h3 className="text-lg font-medium">May 4, 2025</h3>
                        </div>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Fixed issue where the match feed wasn't automatically refreshing after swiping</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Added loading states with spinners during match feed refreshes to improve user experience</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Fixed the problem where profiles kept appearing repeatedly after all available profiles were reviewed</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Added clear messaging when you've reviewed all available candidates with options to check for new candidates</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-medium">May 2, 2025</h3>
                        </div>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">✓</span>
                            <span>Improved profile matching algorithm to show more relevant matches</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">✓</span>
                            <span>Enhanced company profile form with better validation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">✓</span>
                            <span>Fixed slider categories to limit to 5 values per category for better organization</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2" />
                          <h3 className="text-lg font-medium">April 30, 2025</h3>
                        </div>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2">✓</span>
                            <span>Launched beta version of enterN platform</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2">✓</span>
                            <span>Implemented multi-recruiter structure for companies</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-500 mr-2">✓</span>
                            <span>Added slider system with 9 categories and 45 total sliders for comprehensive matching</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
            
            <Card className="shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">info@enter-n.com</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Address</h3>
                    <address className="not-italic text-gray-600 dark:text-gray-300">
                      enterN, Inc.<br />
                      201 SW Adams Street<br />
                      Peoria, IL 61602
                    </address>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Response Time</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We typically respond to all inquiries within 24-48 hours during business days.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-center space-x-4 w-full">
                  <a href="https://www.facebook.com/enterN.platform" className="text-gray-500 hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook text-xl"></i>
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="https://www.linkedin.com/company/104826614/admin/dashboard/" className="text-gray-500 hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin text-xl"></i>
                    <span className="sr-only">LinkedIn</span>
                  </a>
                  <a href="https://www.enter-n.com" className="text-gray-500 hover:text-green-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-globe text-xl"></i>
                    <span className="sr-only">Website</span>
                  </a>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <img src={enternLogo} alt="enterN Logo" className="h-14 mb-4" />
              <p className="text-gray-300 max-w-xs">
                Building a faster, fairer, and frictionless hiring process for all.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-8">
                <nav className="flex flex-col space-y-4" aria-label="Footer">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Employers</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Jobseekers</a>
                </nav>
                
                <nav className="flex flex-col space-y-4" aria-label="Footer Secondary">
                  <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/support" className="text-gray-300 hover:text-white transition-colors">Support</Link>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400">
              © 2025 enterN, All rights reserved.
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Beta version. For bugs or suggestions, email info@enter-n.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}