import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePointerFine } from '../../hooks/usePointerFine';

export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const isFine = usePointerFine();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springPx = useSpring(px, { stiffness: 200, damping: 20 });
  const springPy = useSpring(py, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springPy, [0, 1], [8, -8]);
  const rotateY = useTransform(springPx, [0, 1], [-8, 8]);

  function handleMouseMove(e) {
    if (!isFine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-hover
    >
      {children}
    </motion.div>
  );
}
