import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';

const GOLD = { light: '#a9752c', dark: '#cf9a4a' };
const INACTIVE_DOT = { light: 'rgba(42,32,21,0.18)', dark: 'rgba(243,236,223,0.18)' };

// A single beat in the scrollytelling story column. Lights up (full
// opacity + gold dot) while it crosses the vertical center of the viewport.
export default function StoryBlock({ children, isLast = false, isSignature = false }) {
  const ref = useRef(null);
  const isActive = useInView(ref, { margin: '-40% 0px -40% 0px' });
  const theme = useSelector((s) => s.ui.theme);

  return (
    <div ref={ref} className="flex gap-5">
      <div className="flex shrink-0 flex-col items-center pt-1.5">
        <motion.span
          className="h-2 w-2 rounded-full"
          animate={{ backgroundColor: isActive ? GOLD[theme] : INACTIVE_DOT[theme] }}
          transition={{ duration: 0.4 }}
        />
        {!isLast && <span className="mt-2 w-px flex-1 bg-espresso/10" />}
      </div>
      <motion.div
        animate={{ opacity: isActive ? 1 : 0.28, x: isActive ? 0 : 14 }}
        transition={{ duration: 0.5 }}
        className={isSignature ? 'font-serif text-2xl text-gold-soft italic' : 'max-w-md text-base leading-loose font-light text-espresso/60'}
      >
        {children}
      </motion.div>
    </div>
  );
}
