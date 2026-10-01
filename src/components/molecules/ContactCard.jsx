import Reveal from '../atoms/Reveal';

export default function ContactCard({ icon, title, subtitle, href, label, delay = 0 }) {
  return (
    <Reveal delay={delay} className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-7 text-center transition-colors hover:border-gold/40">
      <div className="mx-auto flex h-11 w-11 items-center justify-center text-2xl text-gold-soft">{icon}</div>
      <h3 className="mt-4 font-display text-lg tracking-wide uppercase">{title}</h3>
      <p className="mt-1 text-sm text-espresso/55">{subtitle}</p>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        data-cursor-hover
        className="mt-4 inline-block text-xs tracking-[0.1em] text-gold-soft uppercase underline decoration-gold/30 underline-offset-4 hover:text-espresso"
      >
        {label}
      </a>
    </Reveal>
  );
}
