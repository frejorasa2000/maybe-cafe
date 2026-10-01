import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getOrderingStatus } from '../data/businessHours';
import { selectCatalog, selectCatalogLoaded } from '../features/catalog/catalogSlice';

// Re-checks every 30s so the page flips to "closed" (or back to open) on its
// own if someone leaves it open across opening/closing time. Ordering also
// waits for the live catalog (hours and prices may have changed in /admin).
export function useOrderingStatus() {
  const catalog = useSelector(selectCatalog);
  const loaded = useSelector(selectCatalogLoaded);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!loaded) return { open: false, loading: true };
  return getOrderingStatus(now, catalog);
}
