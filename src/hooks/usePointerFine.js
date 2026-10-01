import { useEffect, useState } from 'react';

// True on devices with a real mouse/trackpad (hover + fine pointer).
// Used to skip cursor-follow, magnetic and tilt effects on touch screens.
export function usePointerFine() {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFine(mq.matches);
    const onChange = (e) => setIsFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isFine;
}
