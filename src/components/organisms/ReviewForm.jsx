import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitReview, resetReviewForm } from '../../features/reviews/reviewFormSlice';
import StarRatingInput from '../molecules/StarRatingInput';
import Button from '../atoms/Button';
import { REVIEWS_URL } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';

export default function ReviewForm() {
  const { t } = useT();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.reviewForm);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  useEffect(() => {
    if (status === 'success') {
      setName('');
      setText('');
      setRating(5);
    }
  }, [status]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    dispatch(submitReview({ name, rating, text }));
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-gold/30 bg-paper-2/60 p-8 text-center">
        <p className="font-serif text-xl text-gold-soft italic">{t.reviews.successTitle}</p>
        <p className="mt-2 text-sm text-espresso/60">{t.reviews.successBody}</p>
        <button
          type="button"
          onClick={() => dispatch(resetReviewForm())}
          data-cursor-hover
          className="mt-4 text-xs tracking-[0.1em] text-gold uppercase underline underline-offset-4"
        >
          {t.reviews.writeAnotherBtn}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-6 sm:p-8">
      <p className="mb-6 text-center text-sm text-espresso/55">{t.reviews.formIntro}</p>

      <div className="mb-5 flex justify-center">
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.reviews.namePlaceholder}
        className="w-full rounded-lg border border-espresso/15 bg-transparent px-4 py-3 text-sm text-espresso placeholder:text-espresso/35 focus:border-gold focus:outline-none"
      />

      <textarea
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.reviews.textPlaceholder}
        rows={4}
        className="mt-4 w-full resize-none rounded-lg border border-espresso/15 bg-transparent px-4 py-3 text-sm text-espresso placeholder:text-espresso/35 focus:border-gold focus:outline-none"
      />

      {status === 'error' && <p className="mt-3 text-sm text-wine-soft">{error}</p>}

      <div className="mt-6 flex justify-center">
        <Button as="button" type="submit" disabled={status === 'submitting'} className="disabled:opacity-60">
          {status === 'submitting' ? t.reviews.sendingBtn : t.reviews.submitBtn}
        </Button>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-center text-xs text-espresso/45">
          {t.reviews.errorFallbackPrefix}{' '}
          <a href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="text-gold-soft underline">
            {t.reviews.errorFallbackLink}
          </a>
          .
        </p>
      )}
    </form>
  );
}
