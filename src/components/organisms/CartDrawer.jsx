import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeCart,
  decrementItem,
  incrementItem,
  removeItem,
  selectCartItems,
  selectCartTotal,
  selectEstimatedMinutes,
} from '../../features/cart/cartSlice';
import { openCheckout } from '../../features/checkout/checkoutSlice';
import { CloseIcon } from '../atoms/icons/UiIcons';
import Button from '../atoms/Button';
import { useT } from '../../hooks/useT';
import { useOrderingStatus } from '../../hooks/useOrderingStatus';

export default function CartDrawer() {
  const { t, lang } = useT();
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.cart.isOpen);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const estimatedMinutes = useSelector(selectEstimatedMinutes);
  const ordering = useOrderingStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
              <h2 className="font-display text-xl uppercase text-espresso">{t.cart.title}</h2>
              <button
                type="button"
                data-cursor-hover
                onClick={() => dispatch(closeCart())}
                aria-label={t.checkout.closeBtn}
                className="text-espresso"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="mt-10 text-center">
                  <p className="font-serif text-lg text-espresso/70 italic">{t.cart.empty}</p>
                  <p className="mt-2 text-sm text-espresso/50">{t.cart.emptySub}</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 rounded-xl border border-espresso/10 bg-paper-2/60 p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-lg bg-cream object-contain p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-espresso">{item.name}</p>
                        <p className="text-xs text-espresso/50">{item.sizeLabel[lang]} · ${item.price.toFixed(2)}</p>
                        {item.options?.length > 0 && (
                          <p className="text-xs text-espresso/50">{item.options.map((label) => label[lang]).join(', ')}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full border border-espresso/15">
                            <button
                              type="button"
                              data-cursor-hover
                              onClick={() => dispatch(decrementItem(item.id))}
                              className="h-6 w-6 text-espresso/70"
                            >
                              −
                            </button>
                            <span className="min-w-[1ch] text-center text-sm text-espresso">{item.quantity}</span>
                            <button
                              type="button"
                              data-cursor-hover
                              onClick={() => dispatch(incrementItem(item.id))}
                              className="h-6 w-6 text-espresso/70"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            data-cursor-hover
                            onClick={() => dispatch(removeItem(item.id))}
                            className="text-xs text-wine-soft underline underline-offset-2"
                          >
                            {t.cart.remove}
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm text-gold-soft">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-espresso/10 px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-espresso/60 uppercase tracking-[0.1em]">{t.cart.subtotal}</span>
                  <span className="font-serif text-xl text-espresso">${total.toFixed(2)}</span>
                </div>
                <p className="mb-4 text-xs text-espresso/45">{t.cart.estimatedTime(estimatedMinutes)}</p>
                {!ordering.open && !ordering.loading && <p className="mb-3 text-xs text-wine-soft">{t.ordering.closedNotice(ordering.nextOpen)}</p>}
                <Button
                  as="button"
                  type="button"
                  disabled={!ordering.open}
                  className="w-full justify-center disabled:opacity-60"
                  onClick={() => dispatch(openCheckout())}
                >
                  {t.cart.checkoutBtn}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
