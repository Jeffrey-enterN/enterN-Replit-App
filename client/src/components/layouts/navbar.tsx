import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { USER_TYPES } from '@/lib/constants';
import enternLogo from '@/assets/entern-logo.png';

export default function Navbar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo with link to home */}
              <Link href="/">
                <img src={enternLogo} alt="enterN Logo" className="h-14 cursor-pointer" />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="text-gray-700"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-3">
            
            {user ? (
              <Button asChild className="btn-gradient rounded-md px-6 py-2 text-sm font-medium">
                <Link href={user.userType === USER_TYPES.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="rounded-md px-6 py-2 text-sm font-medium border border-[#5CE1E6] bg-white text-[#FF66C4] hover:bg-gray-50">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="ml-3 btn-gradient rounded-md px-6 py-2 text-sm font-medium">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {user ? (
              <Button asChild className="btn-gradient rounded-md w-full py-2 text-sm font-medium mt-3">
                <Link href={user.userType === USER_TYPES.JOBSEEKER ? '/jobseeker/dashboard' : '/employer/dashboard'}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="rounded-md w-full py-2 text-sm font-medium border border-[#5CE1E6] bg-white text-[#FF66C4] hover:bg-gray-50">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="btn-gradient rounded-md w-full py-2 text-sm font-medium mt-3">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link href="/privacy-policy" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                  Privacy Policy
                </Link>
                <Link href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                  Terms of Service
                </Link>
                <Link href="/support" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                  Help & Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}