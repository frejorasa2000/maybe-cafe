import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { closeMobileMenu } from '../../features/ui/uiSlice';
import { PHONE } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';

export default function MobileMenu() {
  const { t } = useT();
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.mobileMenuOpen);

  const links = [
    { href: '#favorites', label: t.nav.favorites },
    { href: '#menu', label: t.nav.menu },
    { href: '#gallery', label: t.nav.gallery },
    { href: '#events', label: t.nav.events },
    { href: '#reviews', label: t.nav.reviews },
    { href: '#reservations', label: t.nav.reservations },
    { href: '#visit', label: t.nav.visit },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex flex-col justify-center gap-8 bg-paper px-8 lg:hidden"
        >
          <nav className="flex flex-col gap-6">
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => dispatch(closeMobileMenu())}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="font-display text-4xl tracking-wide text-espresso uppercase"
              >
                {l.label}
              </motion.a>
            ))}
          </nav>
          <motion.a
            href={PHONE.tel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm tracking-[0.14em] text-gold-soft uppercase"
          >
            {t.mobileMenu.call} {PHONE.display}
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
