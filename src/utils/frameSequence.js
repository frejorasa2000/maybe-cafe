// Shared helpers for the scroll-scrubbed frame animations
// (ScrollVideoBackground = whole page, ScrollFrameSequence = pinned section).

export const framePath = (folder, i) => `${folder}/frame_${String(i + 1).padStart(3, '0')}.webp`;

// First frame, then every 16th, 8th, 4th… so a rough version of the whole
// sequence is ready early and fills in while the visitor reads the hero.
export function loadOrder(count) {
  const order = [];
  const seen = new Set();
  for (let stride = 16; stride >= 1; stride /= 2) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

// Fills the canvas. zoom > 1 crops further in; focusX / focusY (0–1) pick
// which part of the frame stays centred when it is cropped.
export function drawCover(ctx, img, w, h, { zoom = 1, focusX = 0.5, focusY = 0.5 } = {}) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = Math.min(0, Math.max(w - dw, w / 2 - dw * focusX));
  const dy = Math.min(0, Math.max(h - dh, h / 2 - dh * focusY));
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Whole frame visible, its edges feathered to transparent so the background
// colour behind the canvas (sampled from the footage) shows through.
// fitWidth: also shrink a landscape frame so it never gets wider than the
// screen. Without it the frame is cut at the screen edges, its feathered
// borders end up off-screen and the bottom of the subject can be lost.
// maxWidth: cap the drawn width (canvas pixels) — for low-resolution footage
// that would look soft at full-screen size.
// alignY: 'bottom' (default) or 'center'; offsetY lifts the frame by a
// fraction of the screen height (room for captions below it).
export function drawContain(ctx, img, w, h, {
  focusX, scale, fitWidth = false, maxWidth = Infinity, alignY = 'bottom', offsetY = 0,
}) {
  const ratio = img.naturalWidth / img.naturalHeight;
  let dh = h * scale;
  if (fitWidth && ratio * dh > w) dh = w / ratio;
  if (ratio * dh > maxWidth) dh = maxWidth / ratio;
  const dw = ratio * dh;
  // keep the shifted frame inside the screen so its edges stay feathered
  const dx = fitWidth
    ? Math.min(Math.max(w * focusX - dw / 2, 0), w - dw)
    : w * focusX - dw / 2;
  const dy = (alignY === 'center' ? (h - dh) / 2 : h - dh) - h * offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);

  // wide, soft fade: the footage is lighter in the middle than at its edges
  const feather = 0.3;
  ctx.globalCompositeOperation = 'destination-in';
  const gx = ctx.createLinearGradient(dx, 0, dx + dw, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)');
  gx.addColorStop(feather, '#000');
  gx.addColorStop(1 - feather, '#000');
  gx.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  // top / bottom edges: fade only where the frame ends inside the screen
  const fadeTop = dy > 0;
  const fadeBottom = dy + dh < h - 1;
  if (fadeTop || fadeBottom) {
    const gy = ctx.createLinearGradient(0, dy, 0, dy + dh);
    gy.addColorStop(0, fadeTop ? 'rgba(0,0,0,0)' : '#000');
    // fading both ends → half the band each (one end keeps the full band)
    const band = fadeTop && fadeBottom ? feather / 2 : feather;
    if (fadeTop) gy.addColorStop(band, '#000');
    if (fadeBottom) gy.addColorStop(1 - band, '#000');
    gy.addColorStop(1, fadeBottom ? 'rgba(0,0,0,0)' : '#000');
    ctx.fillStyle = gy;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// Draws frame `img` with the sequence's fit settings.
// `maxWidth` is in CSS pixels; `dpr` converts it to canvas pixels.
export function drawFrame(ctx, img, w, h, {
  fit, focusX, mobileScale, small, desktopScale = 1, fitWidth = false,
  maxWidth = Infinity, dpr = 1, alignY = 'bottom', mobileOffsetY = 0,
  zoom = 1, focusY = 0.5,
}) {
  ctx.clearRect(0, 0, w, h);
  if (fit === 'contain') {
    drawContain(ctx, img, w, h, {
      focusX: small ? 0.5 : focusX,
      scale: small ? mobileScale : desktopScale,
      fitWidth: fitWidth && !small,
      maxWidth: small ? Infinity : maxWidth * dpr,
      alignY: small ? 'bottom' : alignY,
      offsetY: small ? mobileOffsetY : 0,
    });
  } else {
    drawCover(ctx, img, w, h, { zoom, focusX, focusY });
  }
}
