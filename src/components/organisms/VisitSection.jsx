import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import Button from '../atoms/Button';
import HoursRow from '../molecules/HoursRow';
import ContactCard from '../molecules/ContactCard';
import { PhoneIcon, PinIcon, ClockIcon } from '../atoms/icons/UiIcons';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../atoms/icons/SocialIcons';
import { ADDRESS, PHONE, MAPS_URL, SOCIAL } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';
import { useSelector } from 'react-redux';
import { selectCatalog } from '../../features/catalog/catalogSlice';
import { localWeekday } from '../../data/businessHours';

// Catalog hours are keyed 0 = Sunday; the list reads Monday → Sunday.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function VisitSection() {
  const { t } = useT();
  const catalog = useSelector(selectCatalog);
  const today = localWeekday();

  return (
    <section id="visit" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <Eyebrow center>{t.visit.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.visit.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.visit.sub}</p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3 text-gold-soft">
              <ClockIcon className="text-lg" />
              <h3 className="font-display text-sm tracking-[0.16em] uppercase">{t.visit.hoursTitle}</h3>
            </div>
            {WEEK_ORDER.map((day) => {
              const h = catalog.hours[day];
              return (
                <HoursRow
                  key={day}
                  day={t.visit.dayNames[day]}
                  hours={h ? `${t.visit.formatTime(h.open)} – ${t.visit.formatTime(h.close)}` : t.visit.closedLabel}
                  closed={!h}
                  isToday={day === today}
                />
              );
            })}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="mt-5 inline-block text-xs tracking-[0.08em] text-espresso/45 underline decoration-espresso/20 underline-offset-4 hover:text-gold-soft"
            >
              {t.visit.suggestHours}
            </a>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <PinIcon className="mt-1 shrink-0 text-xl text-gold-soft" />
              <div>
                <p className="text-xs tracking-[0.14em] text-gold uppercase">{t.visit.addressLabel}</p>
                <p className="mt-1 text-lg">{ADDRESS}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <PhoneIcon className="mt-1 shrink-0 text-xl text-gold-soft" />
              <div>
                <p className="text-xs tracking-[0.14em] text-gold uppercase">{t.visit.phoneLabel}</p>
                <a href={PHONE.tel} className="mt-1 block text-lg hover:text-gold-soft">
                  {PHONE.display}
                </a>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              <Button href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {t.visit.directionsBtn}
              </Button>
              <Button as="a" href={PHONE.tel} variant="ghost">
                {t.visit.callBtn}
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          <ContactCard
            icon={<InstagramIcon />}
            title="Instagram"
            subtitle={t.contact.instagramSub}
            href={SOCIAL.instagram}
            label="@maybe_trailer"
          />
          <ContactCard
            icon={<FacebookIcon />}
            title="Facebook"
            subtitle={t.contact.facebookSub}
            href={SOCIAL.facebook}
            label="Maybe Café"
            delay={0.06}
          />
          <ContactCard
            icon={<TikTokIcon />}
            title="TikTok"
            subtitle={t.contact.tiktokSub}
            href={SOCIAL.tiktok}
            label="@maybe_trailer"
            delay={0.12}
          />
        </div>
      </div>
    </section>
  );
}
