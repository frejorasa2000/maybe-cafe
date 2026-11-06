import { useEffect, useRef, useState } from 'react';
import { drawFrame, framePath, loadOrder } from '../../utils/frameSequence';

// Fixed full-page background: a frame sequence (see src/data/scrollSequences.js)
// is scrubbed as the WHOLE page scrolls — scrolling down plays it forward
// (the iced coffee fills up), scrolling up plays it backwards (it empties).
//
//   <ScrollVideoBackground {...SCROLL_SEQUENCES['iced-coffee']} />
//   <ScrollVideoBackground {...SCROLL_SEQUENCES.acai} />

// Paper wash over the footage: light in the hero, stronger once the
// text-heavy sections start (phones stack text over the footage → heavier).
const DEFAULT_WASH = { hero: 0.2, heroSmall: 0.45, sections: 0.55, sectionsSmall: 0.68 };

export default function ScrollVideoBackground({
  folder,
  frameCount,
  background = 'transparent',
  backgroundGradient = null,
  fit = 'cover',
  focusX = 0.5,
  mobileScale = 1,
  desktopScale = 1,
  fitWidth = false,
  filter = 'none',
  wash = DEFAULT_WASH,
}) {
  const canvasRef = useRef(null);
  const washRef = useRef(null);
  const [small, setSmall] = useState(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const washEl = washRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Phones get half the frames (same resolution, so no quality loss);
    // reduced motion gets a single still of the finished frame.
    const step = small ? 2 : 1;
    const sources = reduced
      ? [frameCount - 1]
      : Array.from({ length: Math.ceil(frameCount / step) }, (_, i) => i * step);

    const images = new Array(sources.length).fill(null);
    let current = 0;
    let drawn = -1;
    let raf = 0;
    let cancelled = false;

    // 0 at the top of the page → 1 at the very bottom
    const progress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    // Closest frame that has already loaded, so fast scrolling never blanks.
    const nearestLoaded = (k) => {
      for (let d = 0; d < images.length; d += 1) {
        if (images[k - d]) return k - d;
        if (images[k + d]) return k + d;
      }
      return -1;
    };

    const draw = (force = false) => {
      const k = nearestLoaded(Math.round(current));
      if (k < 0 || (k === drawn && !force)) return;
      drawn = k;
      drawFrame(ctx, images[k], canvas.width, canvas.height, { fit, focusX, mobileScale, small, desktopScale, fitWidth });
    };

    // Ease toward the scroll position (like a scrub) and stop once settled.
    const tick = () => {
      const target = progress() * (images.length - 1);
      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.05) current = target;
      draw();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const washHero = small ? wash.heroSmall : wash.hero;
    const washSections = small ? wash.sectionsSmall : wash.sections;
    const updateWash = () => {
      const t = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
      washEl.style.opacity = washHero + (washSections - washHero) * t;
    };

    const onScroll = () => {
      updateWash();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.imageSmoothingQuality = 'high';
      draw(true);
    };

    // Preload every frame up front, coarse-to-fine.
    loadOrder(sources.length).forEach((k) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        images[k] = img;
        // a closer frame just arrived — repaint if it beats what's shown
        if (Math.abs(k - current) < Math.abs(drawn - current) || drawn < 0) draw(true);
      };
      img.src = framePath(folder, sources[k]);
    });

    current = reduced ? 0 : progress() * (sources.length - 1);
    updateWash();
    resize();
    window.addEventListener('resize', resize);
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true });
    else window.addEventListener('scroll', updateWash, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', updateWash);
    };
  }, [folder, frameCount, fit, focusX, mobileScale, desktopScale, fitWidth, small, wash]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
      style={{ backgroundColor: background, backgroundImage: backgroundGradient || undefined }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" style={{ filter }} />
      {/* paper wash keeps the page's text readable over the footage */}
      <div ref={washRef} className="absolute inset-0 bg-paper" style={{ opacity: wash.sections }} />
    </div>
  );
}
