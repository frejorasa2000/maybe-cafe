import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloseIcon } from '../atoms/icons/UiIcons';

const LightboxContext = createContext(() => {});

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }) {
  const [active, setActive] = useState(null);

  const open = useCallback((src, alt) => setActive({ src, alt }), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-paper/95 p-6"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-6 right-6 text-espresso/80 hover:text-gold-soft"
            >
              <CloseIcon className="text-3xl" />
            </button>
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={active.src}
              alt={active.alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}
