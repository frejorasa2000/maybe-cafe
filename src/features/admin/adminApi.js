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

// Center-crops to a square and re-encodes as a ~100 KB JPEG, matching the
// square cards on the menu and keeping uploads far under the server limit.
export function resizeToSquareJpeg(file, size = 900) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      const target = Math.min(size, side);
      const canvas = document.createElement('canvas');
      canvas.width = target;
      canvas.height = target;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, target, target);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
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
