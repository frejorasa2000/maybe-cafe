import { useMemo } from 'react';

// Ambient gold embers drifting upward — pure CSS animation, generated once.
export default function EmberField({ count = 22 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 14,
      })),
    [count]
  );

  return (
    <div className="embers-field" aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember"
          style={{
            left: `${e.left}%`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
