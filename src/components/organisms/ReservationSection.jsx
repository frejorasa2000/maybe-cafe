import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import ReservationForm from './ReservationForm';
import InlineScrub from '../atoms/InlineScrub';
import { useT } from '../../hooks/useT';

export default function ReservationSection() {
  const { t } = useT();

  return (
    <section id="reservations" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow center>{t.reservations.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.reservations.heading}</h2>
        </Reveal>

        {/* desktop: iced americano next to the form (plays as the section
            scrolls in); phones: just the form, so the page stays short */}
        <div className="mx-auto max-w-lg lg:grid lg:max-w-none lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <InlineScrub
            sequence="iced-coffee"
            label="Iced americano being poured"
            fit="contain"
            minWidth={1024}
            className="hidden aspect-[3/4] rounded-2xl lg:block"
          />
          <Reveal delay={0.05}>
            <ReservationForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
