import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
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
      applyTheme(systemTheme);
    } else {
      root.classList.add(theme);
      applyTheme(theme);
    }
  }, [theme]);

  const applyTheme = (theme: "light" | "dark") => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";
    root.style.setProperty("--background", isDark ? "#1a1b26" : "#ffffff");
    root.style.setProperty("--foreground", isDark ? "#a9b1d6" : "#1a1b26");
    root.style.setProperty("--card", isDark ? "#24283b" : "#ffffff");
    root.style.setProperty("--card-foreground", isDark ? "#c0caf5" : "#1a1b26");
    root.style.setProperty("--popover", isDark ? "#1a1b26" : "#ffffff");
    root.style.setProperty("--popover-foreground", isDark ? "#c0caf5" : "#1a1b26");
    root.style.setProperty("--primary", isDark ? "#7aa2f7" : "#2563eb");
    root.style.setProperty("--primary-foreground", isDark ? "#1a1b26" : "#ffffff");
    root.style.setProperty("--secondary", isDark ? "#414868" : "#f1f5f9");
    root.style.setProperty("--secondary-foreground", isDark ? "#c0caf5" : "#1a1b26");
    root.style.setProperty("--muted", isDark ? "#24283b" : "#f1f5f9");
    root.style.setProperty("--muted-foreground", isDark ? "#565f89" : "#64748b");
    root.style.setProperty("--accent", isDark ? "#bb9af7" : "#f1f5f9");
    root.style.setProperty("--accent-foreground", isDark ? "#1a1b26" : "#1a1b26");
    root.style.setProperty("--destructive", isDark ? "#f7768e" : "#ef4444");
    root.style.setProperty("--destructive-foreground", isDark ? "#1a1b26" : "#ffffff");
    root.style.setProperty("--border", isDark ? "#414868" : "#e2e8f0");
    root.style.setProperty("--input", isDark ? "#414868" : "#e2e8f0");
    root.style.setProperty("--ring", isDark ? "#7aa2f7" : "#2563eb");
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
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