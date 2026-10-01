import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { markIntroDone } from '../../features/ui/uiSlice';

export default function IntroCurtain() {
  const dispatch = useDispatch();
  const introDone = useSelector((s) => s.ui.introDone);
  const controls = useAnimationControls();

  useEffect(() => {
    if (introDone) return;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(async () => {
      await controls.start({ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } });
      document.body.style.overflow = '';
      dispatch(markIntroDone());
    }, 1300);
    return () => clearTimeout(timer);
  }, [controls, dispatch, introDone]);

  if (introDone) return null;

  return (
    <motion.div
      animate={controls}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-paper"
    >
      <svg width="160" height="2" viewBox="0 0 160 2">
        <motion.line
          x1="0"
          y1="1"
          x2="160"
          y2="1"
          stroke="var(--color-gold)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="font-display text-sm tracking-[0.3em] text-espresso uppercase"
      >
        Maybe Café
      </motion.span>
    </motion.div>
  );
}
