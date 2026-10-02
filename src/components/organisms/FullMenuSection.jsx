import { useSelector } from 'react-redux';
import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import { useLightbox } from './Lightbox';
import { useT } from '../../hooks/useT';
import { selectMenuBoards } from '../../features/catalog/catalogSlice';

export default function FullMenuSection() {
  const { t, lang } = useT();
  const openLightbox = useLightbox();
  // The printed menu boards (and their order) are managed from /admin → Imágenes del menú.
  const pages = useSelector(selectMenuBoards);

  if (pages.length === 0) return null;

  return (
    <section id="menu" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow center>{t.fullMenu.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.fullMenu.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.fullMenu.sub}</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map((page, i) => (
            <Reveal key={page.id} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => openLightbox(page.image, page.alt[lang])}
                data-cursor-hover
                className="block w-full overflow-hidden rounded-xl border border-espresso/10 transition-colors hover:border-gold/50"
              >
                {/* contain (not cover): the boards have slightly different proportions
                    and cropping would cut off item names and prices */}
                <img src={page.image} alt={page.alt[lang]} className="aspect-[2/3] w-full bg-paper-2 object-contain" loading="lazy" />
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-espresso/40 uppercase">{t.fullMenu.hint}</p>
      </div>
    </section>
  );
}
