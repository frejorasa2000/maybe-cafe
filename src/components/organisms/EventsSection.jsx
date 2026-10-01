import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import Button from '../atoms/Button';
import { useT } from '../../hooks/useT';
import tropicalParadise from '../../assets/images/tropical-paradise-acai.jpg';
import { PHONE } from '../../data/siteInfo';

export default function EventsSection() {
  const { t } = useT();
  const [heading1, heading2] = t.events.heading;

  return (
    <section id="events" className="grid gap-0 border-t border-espresso/10 lg:grid-cols-2">
      <Reveal className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
        <img src={tropicalParadise} alt="Tropical Paradise açaí bowl" className="h-full w-full object-cover" style={{ filter: 'saturate(.85)' }} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, #09080a, transparent 30%), linear-gradient(0deg, rgba(110,36,48,.25), transparent 55%)' }}
        />
      </Reveal>

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
