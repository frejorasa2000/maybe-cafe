import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Button from '../atoms/Button';
import Eyebrow from '../atoms/Eyebrow';
import { usePointerFine } from '../../hooks/usePointerFine';
import { useT } from '../../hooks/useT';
import heroPhoto from '../../assets/images/group-matchas.jpg';

const lineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const wordVariants = {
  hidden: { y: '115%' },
  visible: { y: '0%', transition: { duration: 1, ease: [0.16, 0.8, 0.2, 1] } },
};

export default function Hero() {
  const { t } = useT();
  const isFine = usePointerFine();
  const bgRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });

  function handleMouseMove(e) {
    if (!isFine) return;
    mx.set((e.clientX / window.innerWidth - 0.5) * 16);
    my.set((e.clientY / window.innerHeight - 0.5) * 16);
  }

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden" onMouseMove={handleMouseMove}>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(55% 55% at 82% 38%, rgba(169,117,44,.12), transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-28 pb-16 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
        <div>
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>

          <motion.h1
            key={t.hero.line1}
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="mt-6 font-display text-5xl leading-[1.05] tracking-wide text-espresso uppercase sm:text-7xl lg:text-[5.25rem]"
          >
            <span className="block overflow-hidden">
              <motion.span variants={wordVariants} className="inline-block">
                {t.hero.line1}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={wordVariants} className="inline-block">
                {t.hero.line2Prefix}
                <span className="text-wine-soft">{t.hero.line2Accent}</span>
              </motion.span>
            </span>
          </motion.h1>

          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="my-8 block h-px w-32 origin-left bg-linear-to-r from-gold to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-xl font-serif text-xl leading-relaxed text-espresso/70 italic sm:text-2xl"
          >
            {t.hero.lede}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-11 flex flex-wrap items-center gap-6"
          >
            <Button href="#favorites">{t.hero.ctaMenu}</Button>
            <Button as="a" href="#visit" variant="ghost">
              {t.hero.ctaDirections}
            </Button>
          </motion.div>
        </div>

        <motion.div
          ref={bgRef}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 0.8, 0.2, 1] }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <span className="absolute -inset-3 rounded-[2.5rem] border border-gold/30" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#f6f5f3] shadow-[0_40px_80px_-40px_rgba(42,32,21,0.45)]">
            <motion.img
              src={heroPhoto}
              alt="Maybe Café matcha drinks"
              className="h-full w-full animate-kenburns object-cover"
              style={{ x: springX, y: springY }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
