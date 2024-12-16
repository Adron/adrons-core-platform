'use client';

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // First check for user preference in localStorage
    const userPreference = localStorage.getItem('theme');
    
    if (userPreference) {
      setIsDark(userPreference === 'dark');
    } else if (window.matchMedia) {
      // If no user preference, check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);

      // Listen for changes in system dark mode preference
      const handler = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) { // Only update if no user preference
          setIsDark(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Add a function to manually set the theme
  const setTheme = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  return { isDark, setTheme };
} 