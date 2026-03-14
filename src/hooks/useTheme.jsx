import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    return mq.matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('vida_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  const bgColor = theme === 'dark' ? '#050505' : '#f0f0ec';

  if (themeColorMeta) themeColorMeta.setAttribute('content', bgColor);
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const isManualRef = useRef(localStorage.getItem('vida_theme') !== null);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('vida_theme', newTheme);
    isManualRef.current = true;
    applyTheme(newTheme);
  }, []);

  const setSystemTheme = useCallback(() => {
    localStorage.removeItem('vida_theme');
    isManualRef.current = false;
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vida_theme', newTheme);
      isManualRef.current = true;
      applyTheme(newTheme);
      return newTheme;
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }

    const handler = (e) => {
      if (isManualRef.current) return;
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      applyTheme(newTheme);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const value = {
    theme,
    setTheme,
    setSystemTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isManual: isManualRef.current,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
