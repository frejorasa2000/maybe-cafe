import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePointerFine } from '../../hooks/usePointerFine';

// Wraps a button/link and nudges it toward the cursor within its bounds —
// a small "magnetic" pull that makes CTAs feel alive. No-op on touch.
export default function MagneticWrapper({ children, className = '', strength = 0.35 }) {
  const ref = useRef(null);
  const isFine = usePointerFine();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  function handleMouseMove(e) {
    if (!isFine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-hover
    >
      {children}
    </motion.div>
  );
}
