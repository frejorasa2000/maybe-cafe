import { useEffect } from 'react';
import { drawFrame, framePath, loadOrder } from '../utils/frameSequence';

// Scrubs a WebP frame sequence on `canvasRef` with the scroll position of
// `targetRef`: frame 0 when the target's top reaches the top of the screen,
// the last frame when its bottom reaches the bottom of the screen.
// `onProgress(p)` receives the progress (0–1) of the frame on screen.
export function useFrameScrub({
  canvasRef,
  targetRef,
  folder,
  frameCount,
  draw: drawOpts,
  scrub = 0.18,
  small = false,
  reduced = false,
  onProgress,
}) {
  const optsKey = JSON.stringify(drawOpts);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return undefined;
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

    const progress = () => {
      const rect = target.getBoundingClientRect();
      const max = rect.height - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, -rect.top / max)) : rect.top < 0 ? 1 : 0;
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
      drawFrame(ctx, images[k], canvas.width, canvas.height, { ...drawOpts, small, dpr });
    };

    const report = () => onProgress?.(reduced ? 1 : current / Math.max(1, images.length - 1));

    // Ease toward the scroll position (smooth scrub) and stop once settled.
    const tick = () => {
      const t = progress() * (images.length - 1);
      current += (t - current) * scrub;
      if (Math.abs(t - current) < 0.05) current = t;
      draw();
      report();
      raf = current === t ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
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
        if (Math.abs(k - current) < Math.abs(drawn - current) || drawn < 0) draw(true);
      };
      img.src = framePath(folder, sources[k]);
    });

    current = (reduced ? 1 : progress()) * (sources.length - 1);
    report();
    resize();
    window.addEventListener('resize', resize);
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, frameCount, optsKey, scrub, small, reduced]);
}
