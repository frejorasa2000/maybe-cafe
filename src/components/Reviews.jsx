import { useRef, useState, useEffect, useCallback } from 'react';
import { REVIEWS } from '../reviews';
import { GoogleIcon } from './SocialIcons';
import { MAPS_URL } from '../siteInfo';

function Stars({ rating }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasReviews = REVIEWS.length > 0;

  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index];
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, []);

  const scrollBy = useCallback(
    (dir) => {
      const next = Math.max(0, Math.min(REVIEWS.length - 1, activeIndex + dir));
      scrollToIndex(next);
    },
    [activeIndex, scrollToIndex]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => {
      const cards = Array.from(track.children);
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - track.scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="reviews" style={{ background: 'var(--alt-bg)' }}>
      <div className="wrap">
        <div className="section-label">Reviews</div>
        <h2 className="section-title">What People Are Saying</h2>
        <p className="section-sub">Real feedback from real visitors, straight from Google.</p>

        {hasReviews ? (
          <div className="reviews-carousel">
            <button
              className="reviews-arrow left"
              onClick={() => scrollBy(-1)}
              aria-label="Previous review"
              disabled={activeIndex === 0}
            >
              &#8249;
            </button>

            <div className="reviews-track" ref={trackRef}>
              {REVIEWS.map((r, i) => (
                <div className="review-card" key={`${r.name}-${i}`}>
                  <Stars rating={r.rating} />
                  <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                  <div className="review-author">
                    <GoogleIcon />
                    <span>{r.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="reviews-arrow right"
              onClick={() => scrollBy(1)}
              aria-label="Next review"
              disabled={activeIndex === REVIEWS.length - 1}
            >
              &#8250;
            </button>
          </div>
        ) : (
          <p className="section-sub" style={{ marginTop: -24 }}>
            Be the first to leave us a review!
          </p>
        )}

        {hasReviews && (
          <div className="reviews-dots">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                className={i === activeIndex ? 'dot active' : 'dot'}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="reviews-actions">
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
            <GoogleIcon style={{ marginRight: 8, verticalAlign: '-2px' }} />
            Write a Review
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ color: 'var(--coffee)', borderColor: 'var(--coffee)' }}
          >
            See All Reviews
          </a>
        </div>
      </div>
    </section>
  );
}
