import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeColor, setThemeColor] = useState<string>(
    localStorage.getItem('themeColor') || '#E15B55' // Default orange
  );
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
