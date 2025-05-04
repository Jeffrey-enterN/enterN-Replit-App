import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import enternLogo from '@/assets/entern-logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  BellRing,
  LogOut,
  Settings,
  Menu,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import SupportIcon from './icons/support-icon';
import theme from '@/theme';

// NavItem interface for menu items
export interface NavItem {
  label: string;
  href: string;
  icon: React.FC<{className?: string}> | (() => JSX.Element);
}

// Props for the Navbar component
export interface NavbarProps {
  userType: 'employer' | 'jobseeker';
  navItems: NavItem[];
  dashboardPath: string;
  profileLink?: string;
  avatarInitials: string;
  displayName: string;
  dropdownLinks: NavItem[];
  logoHeight?: string;
}

/**
 * Unified Navbar component that can be configured for both employer and jobseeker views
 */
export const Navbar: React.FC<NavbarProps> = ({
  userType,
  navItems,
  dashboardPath,
  profileLink,
  avatarInitials,
  displayName,
  dropdownLinks,
  logoHeight = "h-8",
}) => {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNotificationToggle = () => {
    // In a real app, this would save the preference to the user's profile
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="px-0">
              <div className="flex flex-col gap-4 px-6 py-4">
                <Link href={dashboardPath} className="flex items-center gap-2 font-semibold text-xl">
                  <img 
                    src={enternLogo} 
                    alt="enterN" 
                    className={logoHeight} 
                  />
                  enterN
                </Link>
              </div>
              <nav className="flex flex-col gap-2 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      className="justify-start w-full"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
              <Separator className="my-4" />
              <div className="px-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="notifications-mobile" className="flex items-center gap-2">
                    <BellRing className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <Switch
                    id="notifications-mobile"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href={dashboardPath} className="hidden lg:flex items-center gap-2 font-semibold text-xl">
            <img 
              src={enternLogo} 
              alt="enterN" 
              className={logoHeight} 
            />
            enterN
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-1">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center justify-between cursor-default">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4" />
                  <span>Push Notifications</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/support" className="flex items-center gap-2 cursor-pointer">
                  <SupportIcon />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {displayName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {profileLink && dropdownLinks.length > 0 && (
                <DropdownMenuItem asChild>
                  <Link href={profileLink} className="flex items-center gap-2 cursor-pointer">
                    {React.createElement(dropdownLinks[0].icon, { className: "h-4 w-4" })}
                    Profile
                  </Link>
                </DropdownMenuItem>
              )}
              
              {dropdownLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/support" className="flex items-center gap-2 cursor-pointer">
                  <SupportIcon />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;