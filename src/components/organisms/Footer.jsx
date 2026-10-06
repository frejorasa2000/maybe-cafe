import { useSelector } from 'react-redux';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../atoms/icons/SocialIcons';
import { SOCIAL } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';
import logo from '../../assets/images/logo.png';

export default function Footer() {
  const { t } = useT();
  const theme = useSelector((s) => s.ui.theme);

  return (
    <footer className="border-t border-espresso/10 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <img
            src={logo}
            alt="Maybe Café"
            className="h-7 w-auto opacity-80"
            style={theme === 'dark' ? { filter: 'brightness(0) invert(1)', opacity: 0.85 } : undefined}
          />
          <span className="text-xs text-espresso/45">
            © {new Date().getFullYear()} Maybe Café. {t.footer.rights}
          </span>
          <a href="/privacy" data-cursor-hover className="text-xs text-espresso/60 underline underline-offset-4 hover:text-gold-soft">
            {t.footer.privacy}
          </a>
        </div>
        <div className="flex items-center gap-6 text-espresso/60">
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" data-cursor-hover className="hover:text-gold-soft">
            <InstagramIcon className="text-lg" />
          </a>
          <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" data-cursor-hover className="hover:text-gold-soft">
            <FacebookIcon className="text-lg" />
          </a>
          <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" data-cursor-hover className="hover:text-gold-soft">
            <TikTokIcon className="text-lg" />
          </a>
        </div>
      </div>
    </footer>
  );
}
