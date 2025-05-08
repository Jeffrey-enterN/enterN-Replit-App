import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// User types
type User = {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  userType: string;
  email: string | null;
  companyId: number | null;
  companyRole: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        return await res.json();
      } catch (error) {
        console.error("Login API error:", error);
        throw error; // Re-throw to be handled by onError
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Show success toast
      toast({
        title: "Signed in successfully",
        description: `Welcome back${user.firstName ? ', ' + user.firstName : ''}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      
      // Format error message for better user experience
      let errorMessage = error.message;
      if (errorMessage.includes("401") || errorMessage.includes("Invalid username or password")) {
        errorMessage = "Invalid email or password. Please try again.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        return await res.json();
      } catch (error) {
        console.error("Registration API error:", error);
        throw error; // Re-throw to be handled by onError
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      // Show success toast
      toast({
        title: "Account created successfully!",
        description: "Welcome to enterN. You're now logged in.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      // Format error message for better user experience
      let errorMessage = error.message;
      if (errorMessage.includes("Username already exists")) {
        errorMessage = "This email address is already registered. Please sign in instead.";
      } else if (errorMessage.includes("400")) {
        errorMessage = "Please check your information and try again.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}