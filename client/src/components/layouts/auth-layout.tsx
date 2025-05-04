import React, { ReactNode } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="relative">
          <div className="absolute top-0 left-0">
            <Button 
              variant="ghost"
              size="sm"
              className="text-gray-700 flex items-center gap-1"
              aria-label="Return to homepage"
              asChild
            >
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                Return to homepage
              </Link>
            </Button>
          </div>
          <div className="flex justify-center mt-10">
            <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center">
              <span className="text-white font-bold text-2xl">e</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-heading">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
