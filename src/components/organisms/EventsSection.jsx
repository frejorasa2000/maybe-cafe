import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import Button from '../atoms/Button';
import { useT } from '../../hooks/useT';
import InlineScrub from '../atoms/InlineScrub';
import { PHONE } from '../../data/siteInfo';

export default function EventsSection() {
  const { t } = useT();
  const [heading1, heading2] = t.events.heading;

  return (
    <section id="events" className="grid gap-0 border-t border-espresso/10 lg:grid-cols-2">
      {/* caramel latte being built as the section scrolls in (was the
          Tropical Paradise açaí photo) */}
      <InlineScrub
        sequence="caramel-latte"
        label="Iced caramel latte being poured"
        className="aspect-[4/3] lg:aspect-auto lg:min-h-[36rem]"
        zoom={1.5}
        focusY={0.54}
      />

      <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:py-24 lg:pl-20">
        <Reveal>
          <Eyebrow>{t.events.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">
            {heading1}
            <br />
            {heading2}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/65">{t.events.p}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex flex-col gap-4">
          {t.events.items.map((item, i) => (
            <div key={item} className="flex items-start gap-4 text-sm text-espresso">
              <span className="font-serif text-lg text-gold-soft italic">{String(i + 1).padStart(2, '0')}</span>
              <span className="pt-0.5">{item}</span>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.2} className="mt-10">
          <Button href={PHONE.tel}>
            {t.events.callBtn}: {PHONE.display}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
