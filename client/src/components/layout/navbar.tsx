import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LogIn, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-2xl">enterN</span>
            </a>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </a>
            </Link>
            {isAuthenticated && user?.userType === 'jobseeker' && (
              <>
                <Link href="/jobseeker/dashboard">
                  <a className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </a>
                </Link>
                <Link href="/jobseeker/match-feed">
                  <a className="text-sm font-medium transition-colors hover:text-primary">
                    Matches
                  </a>
                </Link>
              </>
            )}
            {isAuthenticated && user?.userType === 'employer' && (
              <>
                <Link href="/employer/dashboard">
                  <a className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </a>
                </Link>
                <Link href="/employer/match-feed">
                  <a className="text-sm font-medium transition-colors hover:text-primary">
                    Matches
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-sm hidden md:block">
                Hello, <span className="font-medium">{user?.username || 'User'}</span>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href="/api/logout">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </a>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href="/api/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}