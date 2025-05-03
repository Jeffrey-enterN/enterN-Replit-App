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
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="font-bold text-2xl">enterN</span>
            </div>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Home
              </span>
            </Link>
            {isAuthenticated && user?.userType === 'jobseeker' && (
              <>
                <Link href="/jobseeker/dashboard">
                  <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                    Dashboard
                  </span>
                </Link>
                <Link href="/jobseeker/match-feed">
                  <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                    Matches
                  </span>
                </Link>
              </>
            )}
            {isAuthenticated && user?.userType === 'employer' && (
              <>
                <Link href="/employer/dashboard">
                  <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                    Dashboard
                  </span>
                </Link>
                <Link href="/employer/match-feed">
                  <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                    Matches
                  </span>
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
              <form action="/api/logout" method="get" className="m-0">
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </form>
            </div>
          ) : (
            <form action="/api/login" method="get" className="m-0">
              <Button variant="outline" size="sm" type="submit">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}