import { useEffect, useRef, useState } from 'react';
import { useFrameScrub } from '../../hooks/useFrameScrub';
import { SCROLL_SEQUENCES } from '../../data/scrollSequences';

// A frame animation that plays in place while its box scrolls through the
// screen — nothing is pinned, so the page does not get any longer. It starts
// as the box enters (top at range[0] of the screen) and ends once its top has
// risen to range[1]. Settings come from src/data/scrollSequences.js.
//
//   <InlineScrub sequence="caramel-latte" className="aspect-[4/3]" zoom={1.6} />
export default function InlineScrub({
  sequence,
  className = '',
  style,
  fit = 'cover',
  zoom = 1,
  focusX = 0.5,
  focusY = 0.5,
  range = [0.95, 0.15],
  label,
  // only load / play from this screen width up (match the CSS that hides it)
  minWidth = 0,
}) {
  const seq = SCROLL_SEQUENCES[sequence];
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const query = `(min-width: ${minWidth}px)`;
  const [enabled, setEnabled] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  // don't download the frames until the box is about a screen away
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || near) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: '120% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useFrameScrub({
    canvasRef,
    targetRef: boxRef,
    folder: seq.folder,
    frameCount: seq.frameCount,
    scrub: 0.2,
    reduced,
    viewRange: range,
    enabled: enabled && near,
    draw: { fit, zoom, focusX, focusY, desktopScale: 1, alignY: 'center' },
  });

  return (
    <div
      ref={boxRef}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: seq.background, backgroundImage: seq.backgroundGradient || undefined, ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
