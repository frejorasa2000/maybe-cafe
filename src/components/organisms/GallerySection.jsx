import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import { ChevronIcon } from '../atoms/icons/UiIcons';
import { useT } from '../../hooks/useT';
import { selectGallery } from '../../features/catalog/catalogSlice';

const variants = {
  enter: (dir) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
};

export default function GallerySection() {
  const { t, lang } = useT();
  // Photos (and their order) are managed from /admin → Galería.
  const IMAGES = useSelector(selectGallery);
  const [[index, direction], setState] = useState([0, 0]);
  const active = IMAGES.length ? ((index % IMAGES.length) + IMAGES.length) % IMAGES.length : 0;

  function paginate(dir) {
    setState([index + dir, dir]);
  }

  function goTo(i) {
    setState([i, i > active ? 1 : -1]);
  }

  function handleDragEnd(_e, info) {
    const power = Math.abs(info.offset.x) * info.velocity.x;
    if (power < -8000 || info.offset.x < -70) paginate(1);
    else if (power > 8000 || info.offset.x > 70) paginate(-1);
  }

  if (IMAGES.length === 0) return null;

  return (
    <section id="gallery" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow center>{t.gallery.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.gallery.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.gallery.sub}</p>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="relative h-[340px] overflow-hidden rounded-2xl border border-espresso/10 bg-paper-2/60 sm:h-[460px] md:h-[520px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={active}
                src={IMAGES[active].image}
                alt={IMAGES[active].alt[lang]}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain active:cursor-grabbing"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous photo"
              data-cursor-hover
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-paper/60 p-2 text-espresso backdrop-blur-sm transition-colors hover:text-gold-soft sm:left-4"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next photo"
              data-cursor-hover
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-paper/60 p-2 text-espresso backdrop-blur-sm transition-colors hover:text-gold-soft sm:right-4"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {IMAGES.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                data-cursor-hover
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-gold' : 'w-1.5 bg-espresso/20'}`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
