import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "entern-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Force light theme
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Force light mode by removing dark class and adding light class
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    
    // Save to localStorage
    localStorage.setItem(storageKey, "light");
  }, []);

  const toggleTheme = () => {
    // Force light theme - do nothing when toggle is called
    return;
  };

  const value = {
    theme: "light" as Theme,
    setTheme: (theme: Theme) => {
      // Force light theme regardless of what is passed
      localStorage.setItem(storageKey, "light");
      setTheme("light");
      
      // Always make sure we're in light mode
      const root = window.document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
    },
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};