import Reveal from '../atoms/Reveal';
import { StarIcon } from '../atoms/icons/UiIcons';
import { GoogleIcon } from '../atoms/icons/SocialIcons';

export default function ReviewCard({ review, delay = 0 }) {
  return (
    <Reveal delay={delay} className="flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-espresso/10 bg-paper-2/60 p-7 sm:w-[340px]">
      <div className="flex gap-1 text-gold" aria-label={`${review.rating} de 5 estrellas`}>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < review.rating} className={i < review.rating ? '' : 'text-espresso/20'} />
        ))}
      </div>
      <p className="font-serif text-lg leading-relaxed text-espresso/85 italic">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-auto flex items-center gap-2 text-sm text-espresso/60">
        <GoogleIcon />
        <span>{review.name}</span>
      </div>
    </Reveal>
  );
}
