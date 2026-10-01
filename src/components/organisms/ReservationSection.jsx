import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import ReservationForm from './ReservationForm';
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

        <Reveal delay={0.05} className="mx-auto max-w-lg">
          <ReservationForm />
        </Reveal>
      </div>
    </section>
  );
}
