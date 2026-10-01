import { useDispatch } from 'react-redux';
import TiltCard from '../atoms/TiltCard';
import TagPill from '../atoms/TagPill';
import Reveal from '../atoms/Reveal';
import { addItem, openCustomize } from '../../features/cart/cartSlice';
import { getProductGroups } from '../../data/menuOptions';
import { useT } from '../../hooks/useT';

export default function DishListItem({ dish, lang, canOrder = true, delay = 0 }) {
  const dispatch = useDispatch();
  const { t } = useT();

  return (
    <Reveal delay={delay}>
      <TiltCard className="flex items-center gap-5 rounded-2xl border border-espresso/10 bg-paper-2/60 p-4 transition-colors hover:border-gold/50 sm:gap-6 sm:p-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f6f5f3] sm:h-28 sm:w-28">
          <img
            src={dish.image}
            alt={dish.name}
            width={112}
            height={112}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <TagPill tag={dish.tag}>{dish.category}</TagPill>
          <h3 className="mt-2 font-serif text-xl text-espresso sm:text-2xl">{dish.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-espresso/60">{dish.description[lang]}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {dish.sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                data-cursor-hover
                disabled={!canOrder}
                onClick={() =>
                  getProductGroups(dish.id).length > 0
                    ? dispatch(openCustomize({ productId: dish.id, sizeId: size.id }))
                    : dispatch(addItem({ dish, size }))
                }
                className="rounded-full border border-espresso/15 px-3 py-1.5 text-xs text-espresso/70 transition-colors enabled:hover:border-gold enabled:hover:text-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {size.label[lang]} · ${size.price.toFixed(2)}
                {canOrder && <span className="ml-1 text-gold">+ {t.cart.addToCart}</span>}
              </button>
            ))}
          </div>
        </div>
      </TiltCard>
    </Reveal>
  );
}
