import { motion } from 'framer-motion';

export default function GoldDivider({ label }) {
  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { pathLength: 1, transition: { duration: 1.1, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-16 text-espresso/60 sm:gap-5">
      <svg className="h-px flex-1" viewBox="0 0 100 1" preserveAspectRatio="none">
        <motion.line
          x1="0"
          y1="0.5"
          x2="100"
          y2="0.5"
          stroke="var(--color-gold)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={lineVariants}
        />
      </svg>
      <span className="h-2 w-2 shrink-0 rotate-45 bg-gold" />
      {label && <span className="font-serif text-lg italic whitespace-nowrap sm:text-xl">{label}</span>}
      <span className="h-2 w-2 shrink-0 rotate-45 bg-gold" />
      <svg className="h-px flex-1" viewBox="0 0 100 1" preserveAspectRatio="none">
        <motion.line
          x1="0"
          y1="0.5"
          x2="100"
          y2="0.5"
          stroke="var(--color-gold)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={lineVariants}
        />
      </svg>
    </div>
  );
}
