import React from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/layouts/navbar';
import enternLogo from '@/assets/entern-logo.png';

export default function PrivacyPolicyPage() {
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Global Navbar */}
      <Navbar />

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-800 my-8 rounded-lg shadow">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Privacy Policy for enterN</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Effective Date: 05/01/2025</p>
          
          <p className="mb-6 text-gray-800 dark:text-gray-200">
            Welcome to enterN, a hiring platform that empowers early-career jobseekers and employers 
            to find meaningful, bias-resistant matches through anonymized, preference-based profiles. 
            Your privacy is important to us, and this Privacy Policy explains how we collect, use, 
            store, and share your personal information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">We collect the following types of information from jobseekers, employers, and website visitors:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">a. Information You Provide Directly</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Jobseekers:</strong> Name, email address, educational background, work preferences, skills, anonymized profile responses, and feedback on job opportunities.</li>
            <li><strong>Employers:</strong> Business name, recruiter contact info, job descriptions, company preferences, and hiring behavior data (e.g., match selections, response rates).</li>
            <li><strong>Messages and Support Requests:</strong> Any information you voluntarily submit through messages, forms, or support interactions.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">b. Automatically Collected Data</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>IP address, browser type, operating system</li>
            <li>Device identifiers, usage logs, referral sources</li>
            <li>Interactions with the site (clicks, time spent, swipe history)</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">c. Third-Party Integrations</h3>
          <p className="mb-6">
            If you connect with third-party services (e.g., a university Single Sign-On system, LinkedIn, 
            or Google), we may receive additional information such as your profile, email, or verified 
            educational details.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use your data to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Match jobseekers and employers based on preferences and fit</li>
            <li>Improve our AI recommendation systems</li>
            <li>Provide transparency tools like BooBase for ghosting reports</li>
            <li>Conduct analytics and improve product performance</li>
            <li>Communicate with users via email or in-platform messaging</li>
            <li>Ensure safety, prevent fraud, and comply with legal obligations</li>
          </ul>
          
          <p className="mb-6 font-bold">We never sell your personal data. Period.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing and Disclosure</h2>
          <p className="mb-4">We only share your data in the following situations:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>With Employers (Jobseeker-Specific):</strong> Only after mutual interest is expressed (e.g., both sides swipe right). Your anonymized preferences may guide matching prior to revealing your identity.</li>
            <li><strong>With Jobseekers (Employer-Specific):</strong> Only after the employer expresses interest. We may share job details, hiring patterns, and employer behavior labels (e.g., Power Responder).</li>
            <li><strong>With Service Providers:</strong> We work with vetted vendors who support our platform (e.g., cloud hosting, email services, analytics).</li>
            <li><strong>With Consent:</strong> We'll get your permission before sharing anything outside of expected platform use.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose data if legally required (e.g., subpoena, law enforcement request).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights and Choices</h2>
          <p className="mb-4">Depending on your location and applicable laws (e.g., CCPA, GDPR), you may:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct or update your information</li>
            <li>Delete your account and data</li>
            <li>Opt-out of data processing or marketing emails</li>
          </ul>
          
          <p className="mb-6">To exercise your rights, contact us at privacy@entern.co.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p className="mb-4">We implement strong security measures to protect your data, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Encryption (at rest and in transit)</li>
            <li>Access controls and authentication</li>
            <li>Regular audits and security reviews</li>
          </ul>
          
          <p className="mb-6">However, no system is 100% secure. We urge you to use strong passwords and report suspicious activity immediately.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
          <p className="mb-4">We retain your information:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>As long as your account is active</li>
            <li>As needed to fulfill matching, legal, or operational requirements</li>
            <li>For analytics purposes, unless you request deletion</li>
          </ul>
          
          <p className="mb-6">You may delete your account at any time in your settings or by contacting support@entern.co.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
          <p className="mb-6">
            enterN is not intended for individuals under the age of 16. We do not knowingly collect data 
            from children. If we learn we've collected data from a child without consent, we will promptly delete it.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy from time to time. If significant changes are made, we'll 
            notify users via email or through the platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have questions, concerns, or would like to file a privacy-related complaint, please contact:
          </p>
          <address className="not-italic mb-6">
            <strong>enterN, Inc.</strong><br />
            201 SW Adams Street<br />
            Peoria, IL 61602<br />
            Email: <a href="mailto:privacy@entern.co" className="text-blue-600 hover:underline">privacy@entern.co</a>
          </address>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            © 2025 enterN, All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}