import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LanguageToggle from '../components/molecules/LanguageToggle';
import { useT } from '../hooks/useT';
import { privacy, PRIVACY_CONTACT } from '../i18n/privacy';
import logo from '../assets/images/logo.png';

export default function PrivacyPage() {
  const { lang } = useT();
  const theme = useSelector((s) => s.ui.theme);
  const p = privacy[lang];

  useEffect(() => {
    document.title = `${p.title} — Maybe Café`;
  }, [p.title]);

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <a href="/" aria-label={p.backHome}>
            <img
              src={logo}
              alt="Maybe Café"
              className="h-8 w-auto sm:h-9"
              style={theme === 'dark' ? { filter: 'brightness(0) invert(1)', opacity: 0.92 } : undefined}
            />
          </a>
          <LanguageToggle />
        </header>

        <h1 className="mt-14 font-display text-4xl uppercase text-espresso sm:text-5xl">{p.title}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gold">{p.updated}</p>
        <p className="mt-8 font-serif text-xl leading-relaxed text-espresso/80 italic">{p.intro}</p>

        {p.sections.map((section) => (
          <section key={section.heading} className="mt-10 border-t border-espresso/10 pt-8">
            <h2 className="font-display text-2xl uppercase text-espresso">{section.heading}</h2>
            {section.body && <p className="mt-4 leading-relaxed text-espresso/80">{section.body}</p>}
            {section.list && (
              <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-espresso/80 marker:text-gold">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.after && <p className="mt-4 leading-relaxed text-espresso/80">{section.after}</p>}
            {section.contact && (
              <address className="mt-4 flex flex-col gap-1 leading-relaxed text-espresso/80 not-italic">
                <span>Maybe Café</span>
                <span>{PRIVACY_CONTACT.address}</span>
                <a href={`mailto:${PRIVACY_CONTACT.email}`} className="text-gold underline underline-offset-4">
                  {PRIVACY_CONTACT.email}
                </a>
                <a href={PRIVACY_CONTACT.phone.tel} className="text-gold underline underline-offset-4">
                  {PRIVACY_CONTACT.phone.display}
                </a>
              </address>
            )}
          </section>
        ))}

        <div className="mt-14 border-t border-espresso/10 pt-8 text-center">
          <a href="/" className="text-xs uppercase tracking-[0.1em] text-gold-soft underline underline-offset-4">
            {p.backHome}
          </a>
        </div>
      </div>
    </div>
  );
}
