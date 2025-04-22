import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';

export default function LandingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const navigateToJobseeker = () => {
    if (user && user.userType === USER_TYPES.JOBSEEKER) {
      navigate('/jobseeker/dashboard');
    } else {
      navigate('/auth');
      // We can set a preference in localStorage that will be picked up by the auth page
      localStorage.setItem('preferred_role', USER_TYPES.JOBSEEKER);
    }
  };

  const navigateToEmployer = () => {
    if (user && user.userType === USER_TYPES.EMPLOYER) {
      navigate('/employer/dashboard');
    } else {
      navigate('/auth');
      // We can set a preference in localStorage that will be picked up by the auth page
      localStorage.setItem('preferred_role', USER_TYPES.EMPLOYER);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">e</span>
                  </div>
                  <span className="text-primary font-heading font-bold text-xl">enterN</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <Button asChild variant="ghost" className="rounded-md px-4 py-2 text-sm font-medium">
                  <Link href={user.userType === USER_TYPES.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="rounded-md px-4 py-2 text-sm font-medium">
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="ml-3 rounded-md px-4 py-2 text-sm font-medium">
                    <Link href="/auth">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl font-heading">
                  <span className="block xl:inline">The future of</span>
                  <span className="block text-primary xl:inline"> early talent hiring</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  enterN connects employers with early-career talent based on organizational fit and values alignment, not just resumes. Build meaningful connections that lead to lasting careers.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      onClick={navigateToJobseeker}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10"
                    >
                      I'm a Jobseeker
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      onClick={navigateToEmployer}
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      I'm an Employer
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1573497491765-dccce02b29df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" alt="Team collaborating" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase font-heading">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
              A better way to match talent with opportunity
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              enterN uses innovative matching techniques to connect talent with employers based on what really matters.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Anonymous profiles</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Jobseekers create profiles highlighting their values, preferences, and work style - not just their resume.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Two-way matching</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Both employers and jobseekers express interest, creating matches based on mutual enthusiasm.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Better connections</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-600">
                  Connect based on organizational fit and values alignment, leading to more meaningful hiring outcomes.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Employers</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Jobseekers</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Blog</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <i className="fab fa-facebook h-6 w-6"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <i className="fab fa-twitter h-6 w-6"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">LinkedIn</span>
              <i className="fab fa-linkedin h-6 w-6"></i>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 enterN, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
