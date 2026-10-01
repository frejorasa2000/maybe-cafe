import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Button from '../atoms/Button';
import Eyebrow from '../atoms/Eyebrow';
import { usePointerFine } from '../../hooks/usePointerFine';
import { useT } from '../../hooks/useT';
import establishment from '../../assets/images/camion fondo.jpeg';

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
      <div ref={bgRef} className="absolute inset-0 z-0">
        <motion.img
          src={establishment}
          alt=""
          className="h-full w-full animate-kenburns object-cover opacity-40"
          style={{ x: springX, y: springY }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,9,8,.55) 0%, rgba(10,9,8,.68) 45%, #09080a 96%), radial-gradient(60% 60% at 18% 20%, rgba(169,117,44,.16), transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 sm:px-10">
        <Eyebrow>{t.hero.eyebrow}</Eyebrow>

        <motion.h1
          key={t.hero.line1}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
          className="mt-6 font-display text-5xl leading-[1.05] tracking-wide text-[#f3ecdf] uppercase sm:text-7xl lg:text-8xl"
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
          className="max-w-xl font-serif text-xl leading-relaxed text-cream/70 italic sm:text-2xl"
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
          <Button as="a" href="#visit" variant="ghost" className="!text-[#f3ecdf] !border-[#f3ecdf]/60">
            {t.hero.ctaDirections}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
