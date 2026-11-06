import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFrameScrub } from '../../hooks/useFrameScrub';

// Hero + Favorites with a scroll-scrubbed animation (HERO_SEQUENCE in
// src/data/scrollSequences.js). The page always scrolls normally.
//
//   desktop (≥1024px): two columns — `story` and `after` (the Favorites menu)
//     scroll on the left; the animation stays fixed in the right column and
//     never overlaps the content. Its last frame lands when the scene ends,
//     right before Full Menu.
//   phones: the animation is a sticky backdrop behind the story only
//     (`pinHeight.mobile` vh tall); `after` follows on a solid background.

const useMedia = (query) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return match;
};

function Captions({ stages, stage, reduced, className = '' }) {
  const caption = stages[stage];
  if (!caption) return null;
  return (
    <div className={`pointer-events-none absolute left-1/2 z-10 w-[min(90%,26rem)] -translate-x-1/2 text-center ${className}`} aria-live="polite">
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
          <p className="mt-1 font-display text-2xl tracking-wide text-espresso uppercase sm:text-3xl">{caption.title}</p>
          {caption.text && <p className="font-serif text-base text-espresso/75 italic sm:text-lg">{caption.text}</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HeroScene({ seq, stages = [], story, after }) {
  const wide = useMedia('(min-width: 1024px)');
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sceneRef = useRef(null);
  const storyRef = useRef(null);
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(0);

  const starts = stages.map((s, i) => (typeof s.at === 'number' ? s.at : i / stages.length));
  const onProgress = (p) => {
    let s = 0;
    starts.forEach((start, i) => {
      if (p >= start - 0.001) s = i;
    });
    setStage(s);
  };

  useFrameScrub({
    canvasRef,
    // desktop: the whole scene (story + Favorites); phones: the story only
    targetRef: wide ? sceneRef : storyRef,
    folder: seq.folder,
    frameCount: seq.frameCount,
    scrub: seq.scrub,
    small: !wide,
    reduced,
    onProgress,
    draw: {
      fit: 'contain',
      focusX: 0.5,
      desktopScale: seq.panelScale ?? 0.75,
      maxWidth: seq.maxWidth ?? Infinity,
      alignY: 'center',
      mobileScale: seq.mobileScale,
      mobileOffsetY: seq.mobileOffsetY ?? 0,
    },
  });

  const panelBg = { backgroundColor: seq.background, backgroundImage: seq.backgroundGradient || undefined };

  if (wide) {
    return (
      <section id="top" ref={sceneRef} className="relative">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            {story}
            {after}
          </div>
          <div className="relative">
            {/* fixed animation panel, faded into the page on its edges */}
            <div
              aria-hidden="true"
              className="sticky top-0 h-screen overflow-hidden"
              style={{
                ...panelBg,
                ...seq.cssVars,
                maskImage:
                  'linear-gradient(to right, transparent 0%, #000 18%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
                maskComposite: 'intersect',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, #000 18%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
              }}
            >
              <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
              <Captions stages={stages} stage={stage} reduced={reduced} className="bottom-[8vh]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mobileVh = seq.pinHeight?.mobile ?? 180;
  return (
    <section id="top" ref={sceneRef} className="relative">
      {/* at least mobileVh tall; longer story content stretches the animation */}
      <div ref={storyRef} className="relative" style={{ minHeight: reduced ? undefined : `${mobileVh}vh`, ...seq.cssVars }}>
        <div aria-hidden="true" className="pointer-events-none sticky top-0 -mb-[100vh] h-screen overflow-hidden" style={panelBg}>
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
          <Captions stages={stages} stage={stage} reduced={reduced} className="bottom-[3vh]" />
        </div>
        <div className="relative z-10">{story}</div>
      </div>
      <div className="relative z-10 bg-paper">{after}</div>
    </section>
  );
}
