import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePointerFine } from '../../hooks/usePointerFine';

const GOLD = { light: '#a9752c', dark: '#cf9a4a' };
const GOLD_SOFT = { light: '#c38f45', dark: '#e8bb72' };
const GOLD_RGB = { light: '169,117,44', dark: '207,154,74' };

// A small gold ring + dot that trails the mouse, growing over links,
// buttons and cards. Desktop/trackpad only — real touch devices keep
// their native cursor (there is none to replace).
export default function CustomCursor() {
  const isFine = usePointerFine();
  const theme = useSelector((s) => s.ui.theme);
  const [grown, setGrown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26 });

  useEffect(() => {
    if (!isFine) return undefined;

    document.body.classList.add('has-custom-cursor');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) setGrown(true);
    };
    const out = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) setGrown(false);
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, [isFine, x, y]);

  if (!isFine) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[300] -mt-[2.5px] -ml-[2.5px] h-[5px] w-[5px] rounded-full bg-gold-soft"
        style={{ x, y }}
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[300] rounded-full border"
        animate={{
          width: grown ? 64 : 34,
          height: grown ? 64 : 34,
          marginLeft: grown ? -32 : -17,
          marginTop: grown ? -32 : -17,
          backgroundColor: grown ? `rgba(${GOLD_RGB[theme]},0.12)` : `rgba(${GOLD_RGB[theme]},0)`,
          borderColor: grown ? GOLD_SOFT[theme] : GOLD[theme],
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{ x: ringX, y: ringY }}
      />
    </>
  );
}
