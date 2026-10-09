import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('neoparlour-dark-mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neoparlour-dark-mode', isDark);
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
