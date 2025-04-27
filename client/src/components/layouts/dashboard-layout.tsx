import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './settings-dialog';
import JobseekerNav from './jobseeker-nav';
import enternLogo from '@/assets/entern-logo.png';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isJobseekerPage = location.startsWith('/jobseeker/') && location !== '/jobseeker/dashboard' && location !== '/jobseeker/profile';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show persistent nav bar for jobseeker pages that aren't dashboard/profile */}
      {isJobseekerPage && <JobseekerNav />}
      
      {/* Main navigation for dashboard pages */}
      {!isJobseekerPage && (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
                  <div className="flex items-center">
                    <img src={enternLogo} alt="enterN Logo" className="h-12" />
                  </div>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {user?.userType === USER_TYPES.JOBSEEKER && (
                    <>
                      <Link href="/jobseeker/dashboard" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/jobseeker/dashboard" ? "border-b-2 border-primary text-gray-900" : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"}`}>
                        Dashboard
                      </Link>
                      <Link href="/jobseeker/profile" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/jobseeker/profile" ? "border-b-2 border-primary text-gray-900" : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"}`}>
                        Profile
                      </Link>
                    </>
                  )}
                  {user?.userType === USER_TYPES.EMPLOYER && (
                    <>
                      <Link href="/employer/dashboard" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/employer/dashboard" ? "border-b-2 border-primary text-gray-900" : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"}`}>
                        Dashboard
                      </Link>
                      <Link href="/employer/profile" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${location === "/employer/profile" ? "border-b-2 border-primary text-gray-900" : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"}`}>
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {user ? (
                  <>
                    <SettingsDialog 
                      trigger={
                        <button className="rounded-md px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 focus:outline-none">
                          Settings
                        </button>
                      } 
                    />
                    <button 
                      onClick={handleLogout}
                      className="rounded-md px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 focus:outline-none"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" className="rounded-md px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 focus:outline-none">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
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
            &copy; 2023 enterN, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
