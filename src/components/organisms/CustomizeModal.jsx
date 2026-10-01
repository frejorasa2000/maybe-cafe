import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, closeCustomize } from '../../features/cart/cartSlice';
import { selectCatalog, selectMenu } from '../../features/catalog/catalogSlice';
import { defaultSelections, getProductGroups, optionsPrice, resolveSelections } from '../../data/catalog';
import { CloseIcon } from '../atoms/icons/UiIcons';
import Button from '../atoms/Button';
import { useT } from '../../hooks/useT';

// Opens when a size is tapped on a menu card, so the customer can pick milk,
// syrup and cold foam (drinks) or up to two toppings (açaí / mini pancakes)
// before the item goes into the cart.
export default function CustomizeModal() {
  const { t, lang } = useT();
  const dispatch = useDispatch();
  const customizing = useSelector((s) => s.cart.customizing);
  const catalog = useSelector(selectCatalog);
  const menu = useSelector(selectMenu);
  const dish = customizing && menu.find((d) => d.id === customizing.productId);
  const size = dish?.sizes.find((s) => s.id === customizing.sizeId);
  const groups = dish ? getProductGroups(catalog, dish.id) : [];
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (customizing) setSelections(defaultSelections(catalog, customizing.productId));
  }, [customizing, catalog]);

  const resolved = dish ? resolveSelections(catalog, dish.id, selections) : { chosen: [] };
  const total = size ? size.price + optionsPrice(resolved.chosen || []) : 0;

  function toggle(group, optionId) {
    setSelections((prev) => {
      const current = prev[group.id] || [];
      if (current.includes(optionId)) {
        // A required single choice (milk) can be switched but not cleared.
        if (group.required && current.length === 1) return prev;
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (group.max === 1) return { ...prev, [group.id]: [optionId] };
      if (current.length >= group.max) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  }

  function handleAdd() {
    if (resolved.error) return;
    dispatch(addItem({ dish, size, selections, chosen: resolved.chosen }));
    dispatch(closeCustomize());
  }

  return (
    <AnimatePresence>
      {dish && size && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCustomize())}
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl border border-espresso/10 bg-paper shadow-2xl sm:rounded-2xl"
            >
              <div className="flex items-center gap-4 border-b border-espresso/10 px-6 py-5">
                <img
                  src={dish.image}
                  alt={dish.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-lg bg-cream object-cover"
                />
                <div className="min-w-0 flex-1 pr-8">
                  <h2 className="font-serif text-xl text-espresso">{dish.name}</h2>
                  <p className="text-xs text-espresso/50">
                    {size.label[lang]} · ${size.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => dispatch(closeCustomize())}
                  aria-label={t.checkout.closeBtn}
                  className="absolute right-5 top-5 text-espresso"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {groups.map((group) => {
                  const picked = selections[group.id] || [];
                  const full = picked.length >= group.max;
                  return (
                    <fieldset key={group.id} className="border-b border-espresso/10 py-4 last:border-b-0">
                      <legend className="contents">
                        <span className="block font-serif text-lg text-espresso">{group.label[lang]}</span>
                        <span className="mt-0.5 block text-xs text-espresso/50">
                          <span className={group.required ? 'text-gold-soft' : ''}>
                            {group.required ? t.customize.required : t.customize.optional}
                          </span>
                          {' · '}
                          {t.customize.chooseUpTo(group.max)}
                        </span>
                      </legend>
                      <div className="mt-3 flex flex-col">
                        {group.options.map((option) => {
                          const checked = picked.includes(option.id);
                          const disabled = !checked && full && group.max > 1;
                          return (
                            <label
                              key={option.id}
                              data-cursor-hover
                              className={`flex items-center gap-3 py-2 text-sm ${
                                disabled ? 'cursor-not-allowed text-espresso/35' : 'cursor-pointer text-espresso/80'
                              }`}
                            >
                              <input
                                type={group.max === 1 && group.required ? 'radio' : 'checkbox'}
                                name={`${dish.id}-${group.id}`}
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggle(group, option.id)}
                                className="h-4 w-4 shrink-0 accent-[#c9a24b]"
                              />
                              <span className="flex-1">{option.label[lang]}</span>
                              {option.price > 0 && <span className="text-xs text-espresso/50">+${option.price.toFixed(2)}</span>}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>

              <div className="border-t border-espresso/10 px-6 py-5">
                <Button
                  as="button"
                  type="button"
                  disabled={Boolean(resolved.error)}
                  onClick={handleAdd}
                  className="w-full justify-center disabled:opacity-60"
                >
                  {t.customize.addBtn(total)}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
