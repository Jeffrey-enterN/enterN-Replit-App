import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/layouts/navbar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Global Navbar */}
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-800 my-8 rounded-lg shadow">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-6 hover:bg-gray-100 dark:hover:bg-gray-700"
            asChild
          >
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              Return to homepage
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold text-center mb-6">
            <span className="text-gradient font-extrabold">Terms</span> of Service
          </h1>
          <p className="text-gray-500 mb-8 text-center">Last updated: May 4, 2025</p>
        </div>

        <div className="prose prose-stone max-w-none">
          <p>
            The website located at www.entern.io (the "Site") is a copyrighted work belonging to enterN, Inc. ("Company", "us", "our", and "we"). 
            Certain features of the Site may be subject to additional guidelines, terms, or rules, which will be posted on the Site in connection with such features. 
            All such additional terms, guidelines, and rules are incorporated by reference into these Terms.
          </p>

          <p>
            These Terms of Use (these "Terms") set forth the legally binding terms and conditions that govern your use of the Site. 
            By accessing or using the Site, you are accepting these Terms (on behalf of yourself or the entity that you represent), 
            and you represent and warrant that you have the right, authority, and capacity to enter into these Terms 
            (on behalf of yourself or the entity that you represent). You may not access or use the Site or accept the Terms 
            if you are not at least 18 years old.
          </p>

          <h2>PLEASE READ CAREFULLY</h2>
          <p>
            PLEASE BE AWARE THAT SECTION 10.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN YOU AND COMPANY. 
            AMONG OTHER THINGS, SECTION 10.2 INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED EXCEPTIONS, 
            THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL ARBITRATION. 
            SECTION 10.2 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 10.2 CAREFULLY.
          </p>

          <p>
            UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN 30 DAYS: (1) YOU WILL ONLY BE PERMITTED TO PURSUE DISPUTES 
            OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS 
            OR REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR 
            CLASS-WIDE ARBITRATION; AND (2) YOU ARE WAIVING YOUR RIGHT TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF IN A 
            COURT OF LAW AND TO HAVE A JURY TRIAL.
          </p>

          <h2>1. Accounts</h2>
          <h3>1.1 Account Creation</h3>
          <p>
            In order to use certain features of the Site, you must register for an account ("Account") and provide certain 
            information about yourself as prompted by the account registration form. You represent and warrant that: 
            (a) all required registration information you submit is truthful and accurate; (b) you will maintain the accuracy of 
            such information. You may delete your Account at any time, for any reason, by following the instructions on the Site. 
            Company may suspend or terminate your Account in accordance with Section 8.
          </p>

          <h3>1.2 Account Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your Account login information and are fully responsible 
            for all activities that occur under your Account. You agree to immediately notify Company of any unauthorized use, 
            or suspected unauthorized use of your Account or any other breach of security. Company cannot and will not be liable 
            for any loss or damage arising from your failure to comply with the above requirements.
          </p>

          <h2>2. Access to the Site</h2>
          <h3>2.1 License</h3>
          <p>
            Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited license to 
            use and access the Site solely for your own personal, noncommercial use.
          </p>

          <h3>2.2 Certain Restrictions</h3>
          <p>
            The rights granted to you in these Terms are subject to the following restrictions: (a) you shall not license, sell, rent, 
            lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site, whether in whole or in part, 
            or any content displayed on the Site; (b) you shall not modify, make derivative works of, disassemble, reverse compile 
            or reverse engineer any part of the Site; (c) you shall not access the Site in order to build a similar or competitive 
            website, product, or service; and (d) except as expressly stated herein, no part of the Site may be copied, reproduced, 
            distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means. Unless otherwise 
            indicated, any future release, update, or other addition to functionality of the Site shall be subject to these Terms. 
            All copyright and other proprietary notices on the Site (or on any content displayed on the Site) must be retained 
            on all copies thereof.
          </p>

          <h3>2.3 Modification</h3>
          <p>
            Company reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) 
            with or without notice to you. You agree that Company will not be liable to you or to any third party for any 
            modification, suspension, or discontinuation of the Site or any part thereof.
          </p>

          <h3>2.4 No Support or Maintenance</h3>
          <p>
            You acknowledge and agree that Company will have no obligation to provide you with any support or maintenance 
            in connection with the Site.
          </p>

          <h3>2.5 Ownership</h3>
          <p>
            Excluding any User Content that you may provide (defined below), you acknowledge that all the intellectual property rights, 
            including copyrights, patents, trade marks, and trade secrets, in the Site and its content are owned by Company or 
            Company's suppliers. Neither these Terms (nor your access to the Site) transfers to you or any third party any rights, 
            title or interest in or to such intellectual property rights, except for the limited access rights expressly set 
            forth in Section 2.1. Company and its suppliers reserve all rights not granted in these Terms. There are no implied 
            licenses granted under these Terms.
          </p>

          <h2>3. Disclaimers</h2>
          <p>
            THE SITE IS PROVIDED ON AN "AS-IS" AND "AS AVAILABLE" BASIS, AND COMPANY (AND OUR SUPPLIERS) EXPRESSLY DISCLAIM ANY 
            AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR 
            CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT. 
            WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE SITE WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN UNINTERRUPTED, 
            TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, 
            LEGAL, OR SAFE.
          </p>

          <h2>4. Limitation on Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY (OR OUR SUPPLIERS) BE LIABLE TO YOU OR ANY THIRD PARTY 
            FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, 
            INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, OR INABILITY TO USE, 
            THE SITE, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SITE IS AT 
            YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, 
            OR LOSS OF DATA RESULTING THEREFROM.
          </p>

          <h2>5. Term and Termination</h2>
          <p>
            Subject to this Section, these Terms will remain in full force and effect while you use the Site. We may suspend or 
            terminate your rights to use the Site (including your Account) at any time for any reason at our sole discretion, 
            including for any use of the Site in violation of these Terms. Upon termination of your rights under these Terms, 
            your Account and right to access and use the Site will terminate immediately. You understand that any termination of 
            your Account may involve deletion of your User Content associated with your Account from our live databases. 
            Company will not have any liability whatsoever to you for any termination of your rights under these Terms, 
            including for termination of your Account or deletion of your User Content. Even after your rights under these Terms 
            are terminated, the following provisions of these Terms will remain in effect: Sections 2.2 through 2.5, 
            Section 3, and Sections 4 through 10.
          </p>

          <h2>6. Contact Information</h2>
          <p>
            If you have any questions about these Terms or the Site, please contact us at:
          </p>
          <p>
            enterN, Inc.<br />
            Email: info@enter-n.com
          </p>
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