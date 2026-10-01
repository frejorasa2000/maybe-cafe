import { motion } from 'framer-motion';

// Shared scroll-reveal wrapper: fade + rise, once per element.
export default function Reveal({ as = 'div', delay = 0, className = '', children, ...props }) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 0.8, 0.2, 1] }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
