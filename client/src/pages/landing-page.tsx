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
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center">
                    <span className="text-white font-bold text-xl">e</span>
                  </div>
                  <span className="text-gradient font-heading font-bold text-2xl">enterN</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <Button asChild className="btn-gradient rounded-md px-6 py-2 text-sm font-medium">
                  <Link href={user.userType === USER_TYPES.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="rounded-md px-6 py-2 text-sm font-medium border border-[#5CE1E6] bg-white text-[#FF66C4] hover:bg-gray-50">
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="ml-3 btn-gradient rounded-md px-6 py-2 text-sm font-medium">
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
                  <span className="block">Welcome to</span>
                  <span className="block text-gradient font-extrabold">enterN</span>
                  <span className="block text-gradient"> We are rewiring hiring</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  enterN connects employers with early-career talent based on organizational fit and values alignment, not just resumes. Build meaningful connections that lead to lasting careers.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      onClick={navigateToJobseeker}
                      className="w-full flex items-center justify-center px-8 py-3 border-0 text-base font-medium rounded-md text-white btn-gradient md:py-4 md:text-lg md:px-10"
                    >
                      <i className="fas fa-briefcase mr-2"></i>
                      I'm a Jobseeker
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      onClick={navigateToEmployer}
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 border border-[#5CE1E6] text-base font-medium rounded-md bg-white text-[#FF66C4] hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      <i className="fas fa-building mr-2"></i>
                      I'm an Employer
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        {/* No photo here as requested */}
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-gradient font-semibold tracking-wide uppercase font-heading">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
              A better way to <span className="text-gradient">match talent with opportunity</span>
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              enterN uses innovative matching techniques to connect talent with employers based on what really matters.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md btn-gradient text-white">
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md btn-gradient text-white">
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md btn-gradient text-white">
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
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a href="https://www.facebook.com/enterN.platform" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <i className="fab fa-facebook h-6 w-6"></i>
            </a>
            <a href="https://www.linkedin.com/company/104826614/admin/dashboard/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">LinkedIn</span>
              <i className="fab fa-linkedin h-6 w-6"></i>
            </a>
            <a href="https://www.enter-n.com" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Website</span>
              <i className="fas fa-globe h-6 w-6"></i>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            © 2025 enterN, All rights reserved. | enterN is committed to rewiring hiring: building a faster, fairer, and frictionless process for all.
          </p>
          <p className="mt-2 text-center text-sm text-gray-400">
            Beta version. For bugs or suggestions, email info@enter-n.com
          </p>
        </div>
      </footer>
    </div>
  );
}
