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