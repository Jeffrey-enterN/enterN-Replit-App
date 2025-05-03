import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import landLogo from "@assets/enterN - Logo - Landscape.png";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img src={landLogo} alt="enterN Logo" className="h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-primary">
              Welcome to enterN
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to start finding your perfect match
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <Button
              onClick={handleLogin}
              className="w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Log in with Replit"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-tr from-primary-foreground to-primary p-12">
        <div className="h-full flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Revolutionizing Talent Matching
          </h1>
          <p className="text-xl mb-8">
            enterN is transforming how employers and job seekers connect through AI-powered profile matching based on values alignment and organizational fit.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              Bias-free candidate matching
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              Comprehensive values alignment
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-white/20 p-1 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              Intuitive matching experience
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}