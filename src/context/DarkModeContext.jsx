import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('neoparlour-dark-mode');
      if (stored !== null) return stored === 'true';
      const theme = localStorage.getItem('theme');
      if (theme !== null) return theme === 'dark';
      return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neoparlour-dark-mode', String(isDark));
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {}
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    const isDark = typeof document !== 'undefined' && (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('neoparlour-dark-mode') === 'true' ||
      localStorage.getItem('theme') === 'dark'
    );
    return { isDark: Boolean(isDark), toggleDark: () => {} };
  }
  return context;
};
