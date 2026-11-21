import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  // Appearance mode: 'light' | 'dark' | 'system'
  const [mode, setModeState] = useState(() => {
    try {
      const savedMode = localStorage.getItem('user_appearance_mode');
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        return savedMode;
      }
      const stored = localStorage.getItem('neoparlour-dark-mode');
      if (stored !== null) return stored === 'true' ? 'dark' : 'light';
      const theme = localStorage.getItem('theme');
      if (theme !== null) return theme === 'dark' ? 'dark' : 'light';
      return 'system';
    } catch {
      return 'system';
    }
  });

  // Track system preference
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemPrefersDark(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Compute effective dark state
  const isDark = mode === 'system' ? systemPrefersDark : mode === 'dark';

  // Apply .dark class to root and persist
  useEffect(() => {
    try {
      localStorage.setItem('user_appearance_mode', mode);
      localStorage.setItem('neoparlour-dark-mode', String(isDark));
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.warn('Failed to persist appearance mode:', e);
    }
  }, [mode, isDark]);

  const setMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
      setModeState(newMode);
    }
  }, []);

  const toggleDark = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDark, mode, setMode, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    const isDark =
      typeof document !== 'undefined' &&
      (document.documentElement.classList.contains('dark') ||
        localStorage.getItem('neoparlour-dark-mode') === 'true' ||
        localStorage.getItem('theme') === 'dark');
    return {
      isDark: Boolean(isDark),
      mode: isDark ? 'dark' : 'light',
      setMode: () => {},
      toggleDark: () => {}
    };
  }
  return context;
};
