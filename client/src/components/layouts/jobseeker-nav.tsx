import React from 'react';
import { Link } from 'wouter';
import { Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { getInitials } from '@/lib/utils';
import { SettingsDialog } from '../layouts/settings-dialog';

export default function JobseekerNav() {
  const { user } = useAuth();
  
  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" asChild>
              <Link href="/jobseeker/dashboard" className="flex items-center space-x-2">
                <span>Return to Dashboard</span>
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <SettingsDialog 
              trigger={
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              } 
            />
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName && user?.lastName
                  ? getInitials(`${user.firstName} ${user.lastName}`)
                  : user?.username ? getInitials(user.username) : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}