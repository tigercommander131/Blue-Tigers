import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Theme is light by default — a clinical tool should read like a medical
 * record, not a developer dashboard — with a dark option for low-light rooms.
 * Persisted, and applied via a `data-theme` attribute on <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('sim-debrief:theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('sim-debrief:theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  return { theme, toggle };
}
