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
  defaultTheme = "system",
  storageKey = "entern-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      return;
    }
    
    root.classList.add(theme);
  }, [theme]);

  // Make sure the initial theme gets applied
  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem(storageKey) as Theme || defaultTheme;
    
    // On initial load, make sure the theme is applied
    if (initialTheme === 'dark' || (initialTheme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    // Get the current actual theme (accounting for system preference)
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Force the theme to explicitly be light or dark (not system)
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
    
    // Apply the class immediately to avoid visual lag
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
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