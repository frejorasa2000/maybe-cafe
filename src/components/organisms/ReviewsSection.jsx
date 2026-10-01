import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import Button from '../atoms/Button';
import ReviewCard from '../molecules/ReviewCard';
import ReviewForm from './ReviewForm';
import { GoogleIcon } from '../atoms/icons/SocialIcons';
import { StarIcon } from '../atoms/icons/UiIcons';
import { REVIEWS, REVIEW_SUMMARY } from '../../data/reviews';
import { REVIEWS_URL } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';

export default function ReviewsSection() {
  const { t } = useT();
  const hasReviews = REVIEWS.length > 0;

  return (
    <section id="reviews" className="border-t border-espresso/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mx-auto mb-6 max-w-xl text-center">
          <Eyebrow center>{t.reviews.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">{t.reviews.heading}</h2>
          <p className="mt-4 font-serif text-lg text-espresso/60 italic sm:text-xl">{t.reviews.sub}</p>
        </Reveal>

        <Reveal delay={0.05} className="mb-14 flex items-center justify-center gap-2 text-gold-soft">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} filled={i < Math.round(REVIEW_SUMMARY.rating)} />
            ))}
          </div>
          <span className="text-sm text-espresso/60">{t.reviews.summary(REVIEW_SUMMARY.rating, REVIEW_SUMMARY.count)}</span>
        </Reveal>

        {hasReviews ? (
          <div className="mb-14 flex gap-5 overflow-x-auto pb-4">
            {REVIEWS.map((r, i) => (
              <ReviewCard key={`${r.name}-${i}`} review={r} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <Reveal className="mb-14 rounded-2xl border border-dashed border-espresso/15 py-16 text-center">
            <p className="font-serif text-2xl text-espresso/70 italic">{t.reviews.emptyTitle}</p>
            <p className="mt-2 text-sm text-espresso/50">{t.reviews.emptySub}</p>
          </Reveal>
        )}

        <Reveal delay={0.1} className="mb-16 flex justify-center">
          <Button href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            <GoogleIcon /> {t.reviews.writeBtn}
          </Button>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto max-w-lg">
          <ReviewForm />
        </Reveal>
      </div>
    </section>
  );
}
