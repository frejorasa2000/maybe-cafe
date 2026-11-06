import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawFrame, framePath, loadOrder } from '../../utils/frameSequence';

// Reusable scroll-scrubbed animation: a section that stays pinned while a
// sequence of WebP frames (extracted with ffmpeg into
// /public/frames/<folder>/frame_001.webp …) is scrubbed with the scroll, and a
// caption changes stage by stage.
//
// All the per-animation settings live in src/data/scrollSequences.js; pass
// one of those entries as props:
//   <ScrollFrameSequence {...SCROLL_SEQUENCES['acai-v2']} stages={…}>
//     …content shown on the left (optional)…
//   </ScrollFrameSequence>
//
// (Whole-page variant: components/atoms/ScrollVideoBackground.jsx.)

export default function ScrollFrameSequence({
  id,
  folder,
  frameCount,
  background,
  backgroundGradient = null,
  fit = 'cover',
  focusX = 0.5,
  mobileScale = 1,
  desktopScale = 1,
  fitWidth = false,
  maxWidth = Infinity,
  alignY = 'bottom',
  mobileOffsetY = 0,
  // section height in vh; the animation plays over (height − 100vh) of scroll
  pinHeight = null,
  scrollLength = 3,
  // 0–1: how far the shown frame moves toward the scroll position per
  // animation frame (lower = smoother / more lag)
  scrub = 0.18,
  filter = 'none',
  overlay = { desktop: null, mobile: null },
  cssVars = {},
  stages = [],
  ariaLabel,
  // 'pinned'   → the section is pinHeight tall and children sit on top of the
  //              pinned footage (one screen)
  // 'backdrop' → the footage is a sticky background behind normal-flow
  //              children (any length); the last frame lands when the
  //              section's bottom reaches the bottom of the screen
  layout = 'pinned',
  // backdrop: paper veil faded in once the element marked
  // [data-backdrop-wash] scrolls in (keeps text-heavy content legible);
  // the stage captions fade out at the same time
  backdropWash = { desktop: 0.55, mobile: 0.68 },
  className = '',
  children,
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const washRef = useRef(null);
  const captionRef = useRef(null);
  const [stage, setStage] = useState(0);
  // progress of the frame on screen (0–1, in 2 % steps), for children given
  // as a function: {(progress) => …}
  const [shown, setShown] = useState(0);
  const [small, setSmall] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Stage i starts at stages[i].at (0–1 of the animation) when given,
  // otherwise the stages split the animation evenly.
  const stageStarts = stages.map((s, i) => (typeof s.at === 'number' ? s.at : i / stages.length));
  const stageKey = stageStarts.join(',');

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let dpr = 1;

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

    // 0 → 1 across the pinned stretch of the section
    const progress = () => {
      const rect = section.getBoundingClientRect();
      const max = rect.height - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, -rect.top / max)) : 1;
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
      drawFrame(ctx, images[k], canvas.width, canvas.height, {
        fit, focusX, mobileScale, small, desktopScale, fitWidth, maxWidth, dpr, alignY, mobileOffsetY,
      });
    };

    const updateStage = () => {
      // follow the frame actually shown, so the caption matches the picture
      const p = reduced ? 1 : current / Math.max(1, images.length - 1);
      setShown(Math.round(p * 50) / 50);
      if (!stageStarts.length) return;
      let s = 0;
      stageStarts.forEach((start, i) => {
        if (p >= start - 0.001) s = i;
      });
      setStage(s);
    };

    // Ease toward the scroll position (smooth scrub) and stop once settled.
    const tick = () => {
      const target = progress() * (images.length - 1);
      current += (target - current) * scrub;
      if (Math.abs(target - current) < 0.05) current = target;
      draw();
      updateStage();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const washMax = small ? backdropWash.mobile : backdropWash.desktop;
    const updateWash = () => {
      if (layout !== 'backdrop') return;
      const marker = section.querySelector('[data-backdrop-wash]');
      const vh = window.innerHeight;
      const t = marker
        ? Math.min(1, Math.max(0, (vh - marker.getBoundingClientRect().top) / (vh * 0.6)))
        : 0;
      if (washRef.current) washRef.current.style.opacity = String(washMax * t);
      if (captionRef.current) captionRef.current.style.opacity = String(1 - t);
    };

    const onScroll = () => {
      updateWash();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    current = (reduced ? 1 : progress()) * (sources.length - 1);
    updateStage();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, frameCount, fit, focusX, mobileScale, desktopScale, fitWidth, maxWidth, alignY, mobileOffsetY, scrub, small, reduced, stageKey, layout, backdropWash.desktop, backdropWash.mobile]);

  const captionBlock = (caption) =>
    caption && (
      <div
        ref={captionRef}
        className="pointer-events-none absolute bottom-[3vh] left-1/2 z-10 w-[min(90vw,26rem)] -translate-x-1/2 text-center md:bottom-[6vh] md:-translate-x-1/2"
        style={small ? undefined : { left: `${focusX * 100}%` }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${stage}-${caption.title}`}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="font-sans text-[0.65rem] tracking-[0.35em] text-espresso/60 uppercase">
              {String(stage + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
            </span>
            <p className="mt-1 font-display text-2xl tracking-wide text-espresso uppercase sm:text-3xl">
              {caption.title}
            </p>
            {caption.text && (
              <p className="font-serif text-base text-espresso/75 italic sm:text-lg">{caption.text}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );

  if (layout === 'backdrop') {
    const overlayBgB = small ? overlay?.mobile : overlay?.desktop;
    return (
      <section id={id} ref={sectionRef} aria-label={ariaLabel} className={`relative ${className}`} style={cssVars}>
        {/* sticky footage; the negative margin lets the content scroll over it */}
        <div
          aria-hidden="true"
          className="pointer-events-none sticky top-0 -mb-[100vh] h-screen overflow-hidden"
          style={{ backgroundColor: background, backgroundImage: backgroundGradient || undefined }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ filter }} />
          {overlayBgB && <div className="absolute inset-0" style={{ background: overlayBgB }} />}
          <div ref={washRef} className="absolute inset-0 bg-paper" style={{ opacity: 0 }} />
          {captionBlock(stages[stage])}
        </div>
        <div className="relative z-10">{typeof children === 'function' ? children(shown) : children}</div>
      </section>
    );
  }

  const caption = stages[stage];
  const overlayBg = small ? overlay?.mobile : overlay?.desktop;
  const heightVh = pinHeight ? (small ? pinHeight.mobile : pinHeight.desktop) : scrollLength * 100;

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label={ariaLabel}
      className={`relative ${className}`}
      // reduced motion: no pinning, just one screen with the finished frame
      style={{ ...cssVars, height: reduced ? '100vh' : `${heightVh}vh` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ backgroundColor: background, backgroundImage: backgroundGradient || undefined }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block h-full w-full"
          style={{ filter }}
        />
        {overlayBg && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: overlayBg }} />
        )}

        {children && (
          <div className="relative z-10 flex h-full items-start md:items-center">
            {typeof children === 'function' ? children(shown) : children}
          </div>
        )}

        {captionBlock(caption)}
      </div>
    </section>
  );
}
