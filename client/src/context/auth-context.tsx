import { createContext, ReactNode, useContext } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import { User } from "@shared/schema";

type AuthContextType = ReturnType<typeof useAuthHook>;

const defaultContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  refetch: async () => ({ data: null }),
  isAuthenticated: false
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}