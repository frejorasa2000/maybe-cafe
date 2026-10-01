import { slugify } from '../../data/catalog.js';

// Thin client for /api/admin. The custom header is required by the server
// (cheap CSRF guard); the session itself is an HttpOnly cookie.
export async function adminCall(action, body = {}) {
  const res = await fetch(`/api/admin?action=${action}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Maybe-Admin': '1' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'No se pudo conectar con el servidor.');
    error.status = res.status;
    throw error;
  }
  return data;
}

// Re-encodes a photo as a compressed JPEG before upload, keeping uploads far
// under the server limit. `square` center-crops (menu cards are square);
// otherwise the whole photo is kept and just scaled so its longest side is
// at most `max` px (gallery photos can be landscape or portrait).
function resizeImage(file, { square, max }) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const side = Math.min(w, h);
      const src = square ? { x: (w - side) / 2, y: (h - side) / 2, w: side, h: side } : { x: 0, y: 0, w, h };
      const scale = Math.min(1, max / Math.max(src.w, src.h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(src.w * scale);
      canvas.height = Math.round(src.h * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen. Prueba con una foto JPG o PNG.'));
    };
    img.src = url;
  });
}

export const resizeToSquareJpeg = (file) => resizeImage(file, { square: true, max: 900 });
export const resizeToJpeg = (file) => resizeImage(file, { square: false, max: 1600 });

// Resizes and uploads one photo; returns its public URL.
export async function uploadPhoto(file, name, { square }) {
  const dataUrl = square ? await resizeToSquareJpeg(file) : await resizeToJpeg(file);
  const { url } = await adminCall('upload', { dataUrl, name });
  return url;
}

// New products/options get a permanent id from their name right before the
// first save (ids must never change afterwards — carts and Square orders
// refer to them).
function uniqueId(base, taken) {
  let id = base || 'item';
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

export function finalizeNewIds(catalog) {
  const takenProducts = new Set(catalog.products.filter((p) => !p._new).map((p) => p.id));
  const products = catalog.products.map((p) => {
    if (!p._new) return p;
    const { _new, ...rest } = p;
    return { ...rest, id: uniqueId(slugify(p.name), takenProducts) };
  });
  const optionGroups = {};
  for (const [groupId, group] of Object.entries(catalog.optionGroups)) {
    const taken = new Set(group.options.filter((o) => !o._new).map((o) => o.id));
    optionGroups[groupId] = {
      ...group,
      options: group.options.map((o) => {
        if (!o._new) return o;
        const { _new, ...rest } = o;
        return { ...rest, id: uniqueId(slugify(o.label.en || o.label.es), taken) };
      }),
    };
  }
  return { ...catalog, products, optionGroups };
}
