import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeConfig, ThemeDefinition } from '../definitions';

export interface ThemeContextValue {
  /**
   * Current theme mode
   */
  mode: 'light' | 'dark' | 'system';
  
  /**
   * Set theme mode
   */
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  
  /**
   * Current theme
   */
  theme: ThemeDefinition | null;
  
  /**
   * Set custom theme
   */
  setTheme: (theme: ThemeDefinition) => void;
  
  /**
   * Available themes
   */
  themes: Record<string, ThemeDefinition>;
  
  /**
   * Is dark mode active
   */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  /**
   * Theme configuration
   */
  config?: ThemeConfig;
  
  /**
   * Child components
   */
  children: ReactNode;
}

const defaultLightTheme: ThemeDefinition = {
  name: 'light',
  colors: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
};

const defaultDarkTheme: ThemeDefinition = {
  name: 'dark',
  colors: {
    primary: '#38bdf8',
    secondary: '#94a3b8',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
  },
};

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(
    config?.defaultMode || 'system'
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition | null>(null);
  const [isDark, setIsDark] = useState(false);

  const themes = {
    light: defaultLightTheme,
    dark: defaultDarkTheme,
    ...(config?.themes || {}),
  };

  useEffect(() => {
    // Handle system theme detection
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        applyTheme(e.matches ? 'dark' : 'light');
      };

      setIsDark(mediaQuery.matches);
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDark(mode === 'dark');
      applyTheme(mode);
      return undefined;
    }
  }, [mode]);

  const applyTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes] || themes.light;
    setCurrentTheme(theme);

    // Apply CSS variables
    if (config?.useCssVariables !== false) {
      const root = document.documentElement;
      
      // Apply theme class
      root.classList.remove('light', 'dark');
      root.classList.add(themeName === 'dark' ? 'dark' : 'light');

      // Apply color variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--buildkit-${key}`, value as string);
      });

      // Apply font variables
      if (theme.fonts) {
        Object.entries(theme.fonts).forEach(([key, value]) => {
          root.style.setProperty(`--buildkit-font-${key}`, value as string);
        });
      }

      // Apply spacing variables
      if (theme.spacing) {
        Object.entries(theme.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--buildkit-spacing-${key}`, value as string);
        });
      }
    }

    // Apply custom CSS
    if (theme.customCss) {
      let styleElement = document.getElementById('buildkit-theme-custom');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'buildkit-theme-custom';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.customCss;
    }

    // Apply transition
    if (config?.transition) {
      document.documentElement.style.transition = config.transition;
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 500);
    }
  };

  const value: ThemeContextValue = {
    mode,
    setMode,
    theme: currentTheme,
    setTheme: (theme: ThemeDefinition) => {
      (themes as any)[theme.name] = theme;
      if (currentTheme?.name === theme.name) {
        applyTheme(theme.name);
      }
    },
    themes,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}