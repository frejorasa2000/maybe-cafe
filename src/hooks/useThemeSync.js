import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Keeps <html data-theme="..."> and localStorage in sync with Redux so
// CSS (index.css's [data-theme="dark"] overrides) and the next page load
// both reflect the chosen theme.
export function useThemeSync() {
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('maybeCafeTheme', theme);
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }, [theme]);
}
