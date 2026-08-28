import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const LightboxContext = createContext(() => {});

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function LightboxProvider({ children }) {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const stateRef = useRef({ scale: 1, translate: { x: 0, y: 0 } });

  useEffect(() => {
    stateRef.current = { scale, translate };
  }, [scale, translate]);

  const open = useCallback((src, alt) => {
    setImage({ src, alt });
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    setImage(null);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const reset = useCallback(() => {
    stateRef.current = { scale: 1, translate: { x: 0, y: 0 } };
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!image) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image, close]);

  // Zoom while keeping the point under (clientX, clientY) visually fixed.
  const zoomAt = useCallback((clientX, clientY, factorOrScale, isAbsolute) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const { scale: oldScale, translate: oldT } = stateRef.current;

    let newScale = isAbsolute ? factorOrScale : oldScale * factorOrScale;
    newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);

    const px = clientX - cx;
    const py = clientY - cy;
    const localX = (px - oldT.x) / oldScale;
    const localY = (py - oldT.y) / oldScale;
    let newTx = px - newScale * localX;
    let newTy = py - newScale * localY;
    if (newScale === MIN_SCALE) {
      newTx = 0;
      newTy = 0;
    }

    stateRef.current = { scale: newScale, translate: { x: newTx, y: newTy } };
    setScale(newScale);
    setTranslate({ x: newTx, y: newTy });
  }, []);

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0018);
      zoomAt(e.clientX, e.clientY, factor, false);
    },
    [zoomAt]
  );

  // Mouse drag to pan once zoomed in
  const dragRef = useRef(null);
  const onMouseDown = useCallback((e) => {
    if (stateRef.current.scale <= MIN_SCALE) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startT: stateRef.current.translate };
  }, []);
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nt = { x: dragRef.current.startT.x + dx, y: dragRef.current.startT.y + dy };
    stateRef.current = { ...stateRef.current, translate: nt };
    setTranslate(nt);
  }, []);
  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Touch: pinch to zoom, one-finger drag to pan
  const touchRef = useRef(null);
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      touchRef.current = { mode: 'pinch', dist };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { mode: 'pan', x: t.clientX, y: t.clientY, startT: stateRef.current.translate };
    }
  }, []);

  const onTouchMove = useCallback(
    (e) => {
      if (!touchRef.current) return;
      if (e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const mid = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
        if (touchRef.current.mode === 'pinch' && touchRef.current.dist) {
          const factor = dist / touchRef.current.dist;
          zoomAt(mid.x, mid.y, factor, false);
        }
        touchRef.current = { mode: 'pinch', dist };
      } else if (e.touches.length === 1 && touchRef.current.mode === 'pan') {
        if (stateRef.current.scale <= MIN_SCALE) return;
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - touchRef.current.x;
        const dy = t.clientY - touchRef.current.y;
        const nt = { x: touchRef.current.startT.x + dx, y: touchRef.current.startT.y + dy };
        stateRef.current = { ...stateRef.current, translate: nt };
        setTranslate(nt);
      }
    },
    [zoomAt]
  );

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { mode: 'pan', x: t.clientX, y: t.clientY, startT: stateRef.current.translate };
    } else {
      touchRef.current = null;
    }
  }, []);

  const onDoubleClick = useCallback(
    (e) => {
      if (stateRef.current.scale > MIN_SCALE) {
        reset();
      } else {
        zoomAt(e.clientX, e.clientY, 2.5, true);
      }
    },
    [reset, zoomAt]
  );

  return (
    <LightboxContext.Provider value={open}>
      {children}
      {image && (
        <div className="lightbox-backdrop" onClick={close}>
          <button className="lightbox-close" onClick={close} aria-label="Close">
            &times;
          </button>
          <div
            ref={containerRef}
            className="lightbox-frame"
            onClick={(e) => e.stopPropagation()}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={onDoubleClick}
            style={{ cursor: scale > MIN_SCALE ? 'grab' : 'zoom-in' }}
          >
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
            />
          </div>
          <div className="lightbox-hint">Scroll or pinch to zoom &middot; drag to move &middot; double-click to reset</div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  return useContext(LightboxContext);
}
