import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyPolicyModalProps {
  trigger: React.ReactNode;
}

export default function PrivacyPolicyModal({ trigger }: PrivacyPolicyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-screen overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Privacy Policy</DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Last updated: May 4, 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-semibold">
            <h2>Introduction</h2>
            <p>
              Welcome to enterN, a hiring platform that empowers early career talent. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit our website 
              www.entern.io and use our services.
            </p>
            <p>
              We respect your privacy and are committed to protecting it through our compliance with this policy. 
              Please read this policy carefully to understand our policies and practices regarding your information 
              and how we will treat it.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you provide directly to us, including but not limited to:
            </p>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Profile information and credentials</li>
              <li>Education history and work experience</li>
              <li>Skills, preferences, and other information for matching purposes</li>
              <li>Communications between you and enterN</li>
            </ul>

            <h3>Usage Information</h3>
            <p>
              We may automatically collect certain information about how you interact with our Services, such as:
            </p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and features used</li>
              <li>Time and date of your visits</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul>
              <li>Providing and maintaining our Services</li>
              <li>Matching jobseekers with potential employers</li>
              <li>Personalizing your experience</li>
              <li>Communicating with you about our Services</li>
              <li>Improving our platform and developing new features</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>For legal compliance and protection of rights</li>
            </ul>

            <h2>Sharing Your Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Employers or jobseekers as part of our matching service</li>
              <li>Service providers who perform services on our behalf</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>

            <h2>Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized 
              access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
              or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided at the end of this policy.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              enterN, Inc.<br />
              Email: privacy@entern.io
            </p>
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button type="button">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}