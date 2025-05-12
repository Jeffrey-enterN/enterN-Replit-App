import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, FileText, User, Briefcase, Search, MessageSquare, Calendar, Settings, Home, FileCode, Shield } from 'lucide-react';

export default function SiteMap() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [_, navigate] = useLocation();

  // Check if the user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'enterN2025!') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  // Group routes by user type and category
  const routes = {
    public: [
      { path: '/', name: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
      { path: '/auth', name: 'Authentication', icon: <Shield className="h-4 w-4 mr-2" /> },
      { path: '/privacy-policy', name: 'Privacy Policy', icon: <FileText className="h-4 w-4 mr-2" /> },
      { path: '/terms', name: 'Terms of Service', icon: <FileText className="h-4 w-4 mr-2" /> },
      { path: '/site-map', name: 'Site Map', icon: <FileCode className="h-4 w-4 mr-2" /> },
    ],
    development: [
      { path: '/design-system', name: 'UI Style Guide', icon: <FileCode className="h-4 w-4 mr-2" /> },
      { path: '/admin/migration', name: 'Migration Tool', icon: <FileCode className="h-4 w-4 mr-2" /> },
    ],
    jobseeker: [
      { path: '/jobseeker/dashboard', name: 'Dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/profile', name: 'Profile', icon: <User className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/profile/view', name: 'View Profile', icon: <User className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/profile/edit', name: 'Edit Profile', icon: <User className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/match-feed', name: 'Match Feed', icon: <Search className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/matches', name: 'My Matches', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/jobs-feed', name: 'Jobs Feed', icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { path: '/jobseeker/settings', name: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    ],
    employer: [
      { path: '/employer/dashboard', name: 'Dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
      { path: '/employer/company-profile', name: 'Company Profile', icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { path: '/employer/company-profile/preview', name: 'Preview Company Profile', icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { path: '/employer/match-feed', name: 'Match Feed', icon: <Search className="h-4 w-4 mr-2" /> },
      { path: '/employer/matches', name: 'My Matches', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
      { path: '/employer/jobs', name: 'Job Management', icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { path: '/employer/jobs/new', name: 'Create Job', icon: <Briefcase className="h-4 w-4 mr-2" /> },
      { path: '/employer/slider-preferences', name: 'Slider Preferences', icon: <Settings className="h-4 w-4 mr-2" /> },
      { path: '/employer/settings', name: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    ],
    admin: [
      { path: '/admin/database-operations', name: 'Database Operations', icon: <Shield className="h-4 w-4 mr-2" /> },
    ],
  };

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  // Password authentication screen
  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Protected Page</CardTitle>
            <CardDescription>
              Please enter the password to access the site map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit">Access Site Map</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">enterN Site Map</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Public Routes</CardTitle>
            <CardDescription>Pages accessible without authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routes.public.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="flex items-center text-blue-600 hover:underline">
                    {route.icon}
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Development & Design Routes</CardTitle>
            <CardDescription>Pages for design reference and development</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routes.development.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="flex items-center text-blue-600 hover:underline">
                    {route.icon}
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobseeker Routes</CardTitle>
            <CardDescription>Pages accessible to jobseeker users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routes.jobseeker.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="flex items-center text-blue-600 hover:underline">
                    {route.icon}
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employer Routes</CardTitle>
            <CardDescription>Pages accessible to employer users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routes.employer.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="flex items-center text-blue-600 hover:underline">
                    {route.icon}
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Routes</CardTitle>
            <CardDescription>Pages accessible to admin users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routes.admin.map((route) => (
                <li key={route.path}>
                  <Link href={route.path} className="flex items-center text-blue-600 hover:underline">
                    {route.icon}
                    {route.name} <span className="text-xs text-muted-foreground ml-2">{route.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Backend routes for data access and manipulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Authentication</h3>
                <ul className="space-y-1 text-sm">
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/register</code> - Register new user</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/login</code> - Log in user</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/logout</code> - Log out user</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/user</code> - Get current user</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Profile Management</h3>
                <ul className="space-y-1 text-sm">
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/jobseeker/profile</code> - Get/update jobseeker profile</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/jobseeker/profile/draft</code> - Get/update profile draft</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/company/profile</code> - Get/update company profile</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Matching System</h3>
                <ul className="space-y-1 text-sm">
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/matches/feed</code> - Get potential matches</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/swipe/jobseeker</code> - Process jobseeker swipe</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/swipe/employer</code> - Process employer swipe</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/matches</code> - Get all matches</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/matches/:matchId</code> - Get specific match</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/matches/:matchId/share-jobs</code> - Share jobs with jobseeker</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/matches/:matchId/schedule</code> - Schedule interview</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Job Management</h3>
                <ul className="space-y-1 text-sm">
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/employer/jobs</code> - Get/create job postings</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/employer/jobs/:id</code> - Get/update/delete job</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/employer/jobs/:id/status</code> - Update job status</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/jobs/:jobPostingId/interest</code> - Express job interest</li>
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/company/slider-preferences</code> - Update company preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Admin Functions</h3>
                <ul className="space-y-1 text-sm">
                  <li><code className="px-1 py-0.5 bg-muted rounded">/api/admin/database</code> - Database operations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}