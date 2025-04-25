import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import enternLogo from '@/assets/entern-logo.png';

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
          <div className="flex justify-between h-20">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo */}
                <div className="flex items-center">
                  <img src={enternLogo} alt="enterN Logo" className="h-14" />
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
            <main className="mt-12 mx-auto max-w-7xl px-4 sm:mt-16 sm:px-6 md:mt-20 lg:mt-24 lg:px-8 xl:mt-32">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl font-heading">
                  <span className="block text-gradient font-extrabold">enterN: Rewiring Hiring</span>
                </h1>
                <p className="mt-6 text-base text-gray-600 sm:mt-8 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-8 md:text-xl lg:mx-0 leading-relaxed">
                  enterN connects employers with early-career talent based on organizational fit and values alignment, not just resumes. Build meaningful connections that lead to lasting careers.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button 
                    onClick={navigateToJobseeker}
                    className="w-full flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white btn-gradient md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all"
                  >
                    I'm a Jobseeker
                  </Button>
                  <Button 
                    onClick={navigateToEmployer}
                    variant="outline"
                    className="mt-4 sm:mt-0 w-full flex items-center justify-center px-8 py-4 border-2 border-[#5CE1E6] text-base font-medium rounded-lg bg-white text-[#FF66C4] hover:bg-gray-50 md:text-lg md:px-10 shadow-md hover:shadow-lg transition-all"
                  >
                    I'm an Employer
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-gradient font-semibold tracking-wide uppercase font-heading">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
              A better way to <span className="text-gradient">match talent with opportunity</span>
            </p>
            <p className="mt-6 max-w-2xl text-xl text-gray-600 lg:mx-auto leading-relaxed">
              enterN uses innovative matching techniques to connect talent with employers based on what really matters.
            </p>
          </div>

          <div className="mt-16">
            <dl className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-12">
              <div className="relative bg-white p-6 rounded-xl shadow-md transform transition-all hover:scale-105">
                <dt>
                  <div className="absolute top-6 left-6 flex items-center justify-center h-14 w-14 rounded-md btn-gradient text-white shadow-lg">
                    <i className="fas fa-user-circle text-xl"></i>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900 mb-4">Anonymous profiles</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600 leading-relaxed">
                  Jobseekers create profiles highlighting their values, preferences, and work style - not just their resume.
                </dd>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-md transform transition-all hover:scale-105">
                <dt>
                  <div className="absolute top-6 left-6 flex items-center justify-center h-14 w-14 rounded-md btn-gradient text-white shadow-lg">
                    <i className="fas fa-exchange-alt text-xl"></i>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900 mb-4">Two-way matching</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600 leading-relaxed">
                  Both employers and jobseekers express interest, creating matches based on mutual enthusiasm.
                </dd>
              </div>

              <div className="relative bg-white p-6 rounded-xl shadow-md transform transition-all hover:scale-105">
                <dt>
                  <div className="absolute top-6 left-6 flex items-center justify-center h-14 w-14 rounded-md btn-gradient text-white shadow-lg">
                    <i className="fas fa-handshake text-xl"></i>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900 mb-4">Better connections</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600 leading-relaxed">
                  Connect based on organizational fit and values alignment, leading to more meaningful hiring outcomes.
                </dd>
              </div>
            </dl>
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
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a>
                </nav>
              </div>
              
              <div className="flex justify-start space-x-6 mt-4">
                <a href="https://www.facebook.com/enterN.platform" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="https://www.linkedin.com/company/104826614/admin/dashboard/" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="https://www.enter-n.com" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Website</span>
                  <i className="fas fa-globe text-xl"></i>
                </a>
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
