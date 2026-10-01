import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import { ChevronIcon } from '../atoms/icons/UiIcons';
import { useT } from '../../hooks/useT';

import camionFondo from '../../assets/images/camion fondo.jpeg';
import camion from '../../assets/images/camion.jpg';
import cliente from '../../assets/images/cliente.jpg';
import cliente2 from '../../assets/images/cliente2.jpg';
import groupMatchas from '../../assets/images/group-matchas.jpg';
import utencilios from '../../assets/images/utencilios.jpg';
import strawberryMatcha from '../../assets/images/strawberry-matcha.jpg';
import mangoMatcha from '../../assets/images/mango-matcha.jpg';
import bananaPuddingMatcha from '../../assets/images/banana-pudding-matcha.jpg';
import nutellaDream from '../../assets/images/nutella-dream-acai.jpg';
import peanutBerryCrunch from '../../assets/images/peanut-berry-crunch-acai.jpg';
import tropicalParadise from '../../assets/images/tropical-paradise-acai.jpg';
import galeria2 from '../../assets/images/galeria2.jpeg';
import galeria3 from '../../assets/images/galeria 3.jpeg';
import galeria4 from '../../assets/images/galeria 4.jpeg';
import galeria5 from '../../assets/images/galeria 5.jpeg';

const IMAGES = [
  { src: camionFondo, alt: 'Maybe Café' },
  { src: camion, alt: 'Maybe Café trailer on opening night' },
  { src: cliente, alt: 'A customer enjoying Maybe Café' },
  { src: cliente2, alt: 'Maybe Café owner at the trailer' },
  { src: utencilios, alt: 'Matcha preparation' },
  { src: nutellaDream, alt: 'Nutella Dream açaí bowl' },
  { src: tropicalParadise, alt: 'Tropical Paradise açaí bowl' },
  { src: peanutBerryCrunch, alt: 'Peanut Berry Crunch açaí bowl' },
  { src: groupMatchas, alt: 'Our matcha lineup' },
  { src: strawberryMatcha, alt: 'Strawberry Matcha' },
  { src: mangoMatcha, alt: 'Mango Matcha' },
  { src: bananaPuddingMatcha, alt: 'Banana Pudding Matcha' },
  { src: galeria2, alt: 'Maybe Café moments' },
  { src: galeria3, alt: 'Maybe Café moments' },
  { src: galeria4, alt: 'Maybe Café moments' },
  { src: galeria5, alt: 'Maybe Café moments' },
];

const variants = {
  enter: (dir) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
};

export default function GallerySection() {
  const { t } = useT();
  const [[index, direction], setState] = useState([0, 0]);
  const active = ((index % IMAGES.length) + IMAGES.length) % IMAGES.length;

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
                src={IMAGES[active].src}
                alt={IMAGES[active].alt}
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
                key={img.src}
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
