import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import { useLightbox } from './Lightbox';
import { useT } from '../../hooks/useT';
import menu1 from '../../assets/images/menu-1.jpg';
import menu2 from '../../assets/images/menu-2.jpg';
import toppings from '../../assets/images/toppings.jpg';

const PAGES = [
  { img: menu1, alt: 'Maybe Café menu — coffee, matcha, and other drinks' },
  { img: menu2, alt: 'Maybe Café menu — açaí bowls, strawberries & cream bowls, and mini pancakes' },
  { img: toppings, alt: 'Maybe Café topping choices' },
];

export default function FullMenuSection() {
  const { t } = useT();
  const openLightbox = useLightbox();

  return (
    <section id="menu" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow center>{t.fullMenu.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.fullMenu.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.fullMenu.sub}</p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {PAGES.map((page, i) => (
            <Reveal key={page.img} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => openLightbox(page.img, page.alt)}
                data-cursor-hover
                className="block w-full overflow-hidden rounded-xl border border-espresso/10 transition-colors hover:border-gold/50"
              >
                <img src={page.img} alt={page.alt} className="aspect-[2/3] w-full object-cover" loading="lazy" />
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-espresso/40 uppercase">{t.fullMenu.hint}</p>
      </div>
    </section>
  );
}
