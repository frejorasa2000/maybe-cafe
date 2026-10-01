import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import DishListItem from '../molecules/DishListItem';
import { MENU } from '../../data/menu';
import { useT } from '../../hooks/useT';
import { useOrderingStatus } from '../../hooks/useOrderingStatus';

export default function MenuSection() {
  const { t, lang } = useT();
  const ordering = useOrderingStatus();

  return (
    <section id="favorites" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-16 max-w-xl text-center sm:mb-20">
          <Eyebrow center>{t.favorites.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.favorites.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.favorites.sub}</p>
        </Reveal>

        {!ordering.open && (
          <p className="mx-auto mb-8 max-w-xl rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold-soft">
            {t.ordering.closedNotice(ordering.nextOpen)}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {MENU.map((dish, i) => (
            <DishListItem key={dish.id} dish={dish} lang={lang} canOrder={ordering.open} delay={(i % 2) * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
