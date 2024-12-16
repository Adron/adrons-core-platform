'use client';

import { useDarkMode } from '@/app/hooks/useDarkMode';

export function ThemeToggle() {
  const { isDark, setTheme } = useDarkMode();

  return (
    <button
      onClick={() => setTheme(!isDark)}
      className="px-4 py-2 rounded-md"
    >
      {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  );
} 