import { useEffect, useState } from 'react';
import { getOrderingStatus } from '../data/businessHours';

// Re-checks every 30s so the page flips to "closed" (or back to open) on its
// own if someone leaves it open across opening/closing time.
export function useOrderingStatus() {
  const [status, setStatus] = useState(() => getOrderingStatus());

  useEffect(() => {
    const timer = setInterval(() => setStatus(getOrderingStatus()), 30000);
    return () => clearInterval(timer);
  }, []);

  return status;
}
