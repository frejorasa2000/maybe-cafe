import { useState } from 'react';
import { StarIcon } from '../atoms/icons/UiIcons';

export default function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            aria-label={`${star} estrellas`}
            data-cursor-hover
            className="text-2xl text-gold transition-transform hover:scale-110"
          >
            <StarIcon filled={star <= shown} className={star <= shown ? '' : 'text-espresso/25'} />
          </button>
        );
      })}
    </div>
  );
}
