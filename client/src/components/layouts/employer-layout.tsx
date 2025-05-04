import { ReactNode } from 'react';
import { Link } from 'wouter';
import EmployerNavbar from './employer-navbar';

interface EmployerLayoutProps {
  children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EmployerNavbar />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Beta Tester Instructions */}
      <div className="bg-blue-50 border-t border-blue-200">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 text-sm text-blue-700">
              <p>
                <span className="font-medium">Beta Testing:</span> Thank you for helping us improve! Please report any bugs to <a href="mailto:info@enter-n.com" className="font-bold underline">info@enter-n.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
            </div>
          </nav>
          <p className="mt-4 text-center text-xs text-gray-400">
            &copy; 2025 enterN, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}