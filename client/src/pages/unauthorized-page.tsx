import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Shield className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/logout">Sign Out</a>
          </Button>
        </div>
      </div>
    </div>
  );
}