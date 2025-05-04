import React, { ReactNode } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/layouts/navbar';

interface AuthLayoutProps {
  children: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar at the top */}
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="relative">
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
    </div>
  );
}
