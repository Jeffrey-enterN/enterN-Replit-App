import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Link, useLocation } from 'wouter';
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
  X,
  UserCircle,
  Building,
  Briefcase,
  LayoutDashboard,
  GraduationCap,
  ThumbsUp,
  FileText,
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';

export default function JobseekerNavbar() {
  const { user, logoutMutation } = useAuth();
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

  const navItems = [
    { label: 'Dashboard', href: '/jobseeker/dashboard', icon: LayoutDashboard },
    { label: 'Match Feed', href: '/jobseeker/match-feed', icon: ThumbsUp },
    { label: 'Jobs Feed', href: '/jobseeker/jobs-feed', icon: Briefcase },
    { label: 'Profile', href: '/jobseeker/profile', icon: UserCircle },
    { label: 'Preview Profile', href: '/jobseeker/profile-preview', icon: Eye },
    { 
      label: 'BooBase', 
      href: 'https://boobase-by-entern.replit.app/', 
      icon: ExternalLink,
      isExternal: true
    },
    { 
      label: 'Support', 
      href: '/support', 
      icon: () => (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    }
  ];

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
                <Link href="/jobseeker/dashboard" className="flex items-center gap-2 font-semibold text-xl">
                  <img 
                    src={enternLogo} 
                    alt="enterN" 
                    className="h-8" 
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
                      {item.isExternal ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </a>
                      ) : (
                        <Link href={item.href}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      )}
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

          <Link href="/jobseeker/dashboard" className="hidden lg:flex items-center gap-2 font-semibold text-xl">
            <img 
              src={enternLogo} 
              alt="enterN" 
              className="h-8" 
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
                  {item.isExternal ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="flex items-center gap-1">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
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
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
                  <AvatarFallback>
                    {user?.firstName && user?.lastName
                      ? getInitials(`${user.firstName} ${user.lastName}`)
                      : user?.username ? getInitials(user.username) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/jobseeker/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jobseeker/profile-preview" className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  Preview Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jobseeker/match-feed" className="flex items-center gap-2 cursor-pointer">
                  <ThumbsUp className="h-4 w-4" />
                  Match Feed
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jobseeker/jobs-feed" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className="h-4 w-4" />
                  Jobs Feed
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://boobase-by-entern.replit.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  BooBase
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/support" className="flex items-center gap-2 cursor-pointer">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
}