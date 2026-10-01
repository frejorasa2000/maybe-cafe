import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMobileMenu } from '../../features/ui/uiSlice';
import NavLink from '../molecules/NavLink';
import LanguageToggle from '../molecules/LanguageToggle';
import ThemeToggle from '../molecules/ThemeToggle';
import CartButton from '../molecules/CartButton';
import Button from '../atoms/Button';
import { MenuIcon, CloseIcon } from '../atoms/icons/UiIcons';
import { useT } from '../../hooks/useT';
import logo from '../../assets/images/logo.png';

export default function Header() {
  const { t } = useT();
  const dispatch = useDispatch();
  const mobileMenuOpen = useSelector((s) => s.ui.mobileMenuOpen);
  const theme = useSelector((s) => s.ui.theme);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Light text over the dark hero photo; switches to dark text once the
  // page is scrolled onto the light paper theme, or while the (light) full
  // -screen mobile menu is open behind the header.
  const useLight = !scrolled && !mobileMenuOpen;
  // The logo mark itself needs light/dark based on whatever is actually
  // behind it: the dark hero photo, OR a dark-mode header/mobile-menu once
  // the site theme is switched to dark.
  const logoIsLight = useLight || theme === 'dark';

  const links = [
    { href: '#favorites', label: t.nav.favorites },
    { href: '#menu', label: t.nav.menu },
    { href: '#gallery', label: t.nav.gallery },
    { href: '#events', label: t.nav.events },
    { href: '#reviews', label: t.nav.reviews },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 transition-[padding,background-color,border-color] duration-300 sm:px-10 ${
        scrolled ? 'border-b border-espresso/10 bg-paper/85 py-4 backdrop-blur-md' : 'border-b border-transparent py-6'
      }`}
    >
      <a href="#top" data-cursor-hover className="flex items-center gap-3">
        <img
          src={logo}
          alt="Maybe Café"
          className="h-8 w-auto sm:h-9"
          style={logoIsLight ? { filter: 'brightness(0) invert(1)', opacity: 0.92 } : undefined}
        />
      </a>

      <nav className="hidden items-center gap-8 lg:flex">
        {links.map((l) => (
          <NavLink key={l.href} href={l.href} className={useLight ? '!text-[#f3ecdf]/90' : ''}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="hidden items-center gap-3 lg:flex">
        <ThemeToggle light={useLight} />
        <LanguageToggle light={useLight} />
        <CartButton light={useLight} />
        <Button href="#reservations" className="!py-3.5 !px-6 !ml-2 !text-[11px]">
          {t.nav.reserve}
        </Button>
      </div>

      <div className="flex items-center gap-3 lg:hidden">
        <ThemeToggle light={useLight} />
        <LanguageToggle light={useLight} />
        <CartButton light={useLight} />
        <button
          type="button"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          data-cursor-hover
          className={useLight ? 'text-[#f3ecdf]' : 'text-espresso'}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
