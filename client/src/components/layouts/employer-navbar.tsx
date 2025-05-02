import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Link, useLocation } from 'wouter';
import { useTheme } from 'next-themes';
import enternLogo from '@/assets/entern.png';
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
  Moon,
  Sun,
  Settings,
  Menu,
  X,
  UserCircle,
  Building,
  Briefcase,
  LayoutDashboard,
  Users,
  Users2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function EmployerNavbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show theme only after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNotificationToggle = () => {
    // In a real app, this would save the preference to the user's profile
    setNotificationsEnabled(!notificationsEnabled);
  };

  const getInitials = () => {
    if (!user) return '?';
    
    if (user.companyName) {
      return user.companyName.substring(0, 2).toUpperCase();
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { label: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
    { label: 'Company Profile', href: '/employer/company-profile', icon: Building },
    { label: 'Team', href: '/employer/company-team', icon: Users },
    { label: 'Jobs', href: '/employer/jobs', icon: Briefcase },
    { label: 'Candidates', href: '/employer/candidates', icon: Users2 },
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
                <Link href="/employer/dashboard" className="flex items-center gap-2 font-semibold text-xl">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-mobile" className="flex items-center gap-2">
                    {mounted && theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </Label>
                  <Switch
                    id="theme-mobile"
                    checked={mounted && theme === "dark"}
                    onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/employer/dashboard" className="hidden lg:flex items-center gap-2 font-semibold text-xl">
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
              <DropdownMenuItem className="flex items-center justify-between cursor-default">
                <div className="flex items-center gap-2">
                  {mounted && theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  checked={mounted && theme === "dark"}
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
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
                  {/* Will use company logo in future when available */}
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.companyName ? user.companyName : user?.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/employer/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCircle className="h-4 w-4" />
                  Your Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/employer/company-profile" className="flex items-center gap-2 cursor-pointer">
                  <Building className="h-4 w-4" />
                  Company Profile
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