// Pure helpers over a catalog object (see defaultCatalog.js for its shape).
// No image imports and no browser APIs, so the same code runs in the site,
// the admin panel, and the api/ functions — which recompute every price from
// the stored catalog instead of trusting anything the browser sends.

export const SIZE_LABELS = {
  '16oz': { en: '16 oz', es: '16 oz' },
  '20oz': { en: '20 oz', es: '20 oz' },
  bowl: { en: '16 oz bowl', es: 'Bowl 16 oz' },
  pancakes: { en: '10 pcs', es: '10 piezas' },
};

export const GROUP_IDS = ['milk', 'syrup', 'coldFoam', 'toppings'];

// Colors available for the category pill (see atoms/TagPill.jsx).
export const TAGS = ['coffee', 'latte', 'matcha', 'acai', 'pancakes'];

export function getProduct(catalog, productId) {
  return catalog.products.find((p) => p.id === productId) || null;
}

export function buildSizes(product) {
  if (!product) return [];
  return Object.entries(product.sizes).map(([id, price]) => ({ id, label: SIZE_LABELS[id], price }));
}

// The option groups a product offers, with only the options currently
// available (inactive ones stay in the catalog but can't be picked).
export function getProductGroups(catalog, productId) {
  const product = getProduct(catalog, productId);
  if (!product) return [];
  return product.groups
    .filter((g) => catalog.optionGroups[g.id])
    .map((g) => {
      const group = catalog.optionGroups[g.id];
      return { ...group, id: g.id, required: g.required, options: group.options.filter((o) => o.active) };
    })
    .filter((g) => g.options.length > 0);
}

export function defaultSelections(catalog, productId) {
  const selections = {};
  for (const group of getProductGroups(catalog, productId)) {
    selections[group.id] = group.required ? [group.options[0].id] : [];
  }
  return selections;
}

// Turns { groupId: [optionId] } into a flat list of chosen options, or
// { error } when something is unknown, over the limit, or missing.
export function resolveSelections(catalog, productId, selections = {}) {
  const groups = getProductGroups(catalog, productId);
  const chosen = [];
  for (const key of Object.keys(selections || {})) {
    if (!groups.some((g) => g.id === key)) return { error: `Invalid option group "${key}".` };
  }
  for (const group of groups) {
    const ids = Array.isArray(selections?.[group.id]) ? selections[group.id] : [];
    if (new Set(ids).size !== ids.length || ids.length > group.max) return { error: `Too many choices for ${group.label.en}.` };
    if (group.required && ids.length === 0) return { error: `Please choose a ${group.label.en.toLowerCase()}.` };
    for (const id of ids) {
      const option = group.options.find((o) => o.id === id);
      if (!option) return { error: `Invalid choice for ${group.label.en}.` };
      chosen.push({ groupId: group.id, ...option });
    }
  }
  return { chosen };
}

export const optionsPrice = (chosen) => chosen.reduce((sum, o) => sum + o.price, 0);

// Products shaped the way the menu cards and cart expect them, in menu order.
export function menuFromCatalog(catalog) {
  return catalog.products
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tag: p.tag,
      description: p.description,
      image: p.image,
      sizes: buildSizes(p),
      hasOptions: getProductGroups(catalog, p.id).length > 0,
    }));
}

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// Validation of a catalog coming from the admin panel. Returns a clean copy
// (only known fields, trimmed, rounded) or { error } in Spanish, since the
// owner is the one who reads it.

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// Images are either bundled ones (/menu/..., /gallery/...) or uploads to Vercel Blob.
const IMAGE_RE = /^(\/(menu|gallery)\/[\w.-]+|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./-]+)$/i;
const MAX_GALLERY = 60;

function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function price(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 999) return null;
  return Math.round(n * 100) / 100;
}

function bilingual(value, max, field) {
  const en = text(value?.en, max);
  const es = text(value?.es, max);
  if (!en || !es) return { error: `Falta ${field} en inglés o en español.` };
  return { value: { en, es } };
}

export function validateCatalog(input) {
  if (!input || typeof input !== 'object') return { error: 'Datos inválidos.' };

  // Option groups
  const optionGroups = {};
  for (const groupId of GROUP_IDS) {
    const g = input.optionGroups?.[groupId];
    if (!g) return { error: `Falta el grupo de opciones "${groupId}".` };
    const label = bilingual(g.label, 40, `el nombre del grupo "${groupId}"`);
    if (label.error) return label;
    const max = Number(g.max);
    if (!Number.isInteger(max) || max < 1 || max > 10) return { error: `El máximo de "${label.value.es}" debe ser entre 1 y 10.` };
    if (!Array.isArray(g.options) || g.options.length > 80) return { error: `Opciones inválidas en "${label.value.es}".` };
    const seen = new Set();
    const options = [];
    for (const o of g.options) {
      const optLabel = bilingual(o?.label, 60, `el nombre de una opción en "${label.value.es}"`);
      if (optLabel.error) return optLabel;
      const id = text(o.id, 60);
      if (!ID_RE.test(id) || seen.has(id)) return { error: `La opción "${optLabel.value.es}" tiene un identificador repetido o inválido.` };
      seen.add(id);
      const p = price(o.price);
      if (p === null) return { error: `Precio inválido en "${optLabel.value.es}".` };
      options.push({ id, label: optLabel.value, price: p, active: o.active !== false });
    }
    optionGroups[groupId] = { label: label.value, max, options };
  }

  // Products
  if (!Array.isArray(input.products) || input.products.length > 150) return { error: 'Lista de productos inválida.' };
  const seenIds = new Set();
  const products = [];
  for (const p of input.products) {
    const name = text(p?.name, 60);
    if (!name) return { error: 'Hay un producto sin nombre.' };
    const id = text(p.id, 60);
    if (!ID_RE.test(id) || seenIds.has(id)) return { error: `"${name}" tiene un identificador repetido o inválido.` };
    seenIds.add(id);
    const category = text(p.category, 40);
    if (!category) return { error: `"${name}" no tiene categoría.` };
    const tag = TAGS.includes(p.tag) ? p.tag : 'latte';
    const description = bilingual(p.description, 300, `la descripción de "${name}"`);
    if (description.error) return description;
    const image = text(p.image, 400);
    if (!IMAGE_RE.test(image)) return { error: `"${name}" necesita una foto.` };

    const sizes = {};
    for (const [sizeId, value] of Object.entries(p.sizes || {})) {
      if (!SIZE_LABELS[sizeId]) return { error: `Tamaño desconocido en "${name}".` };
      const sp = price(value);
      if (sp === null || sp === 0) return { error: `Precio inválido para ${SIZE_LABELS[sizeId].es} en "${name}".` };
      sizes[sizeId] = sp;
    }
    if (Object.keys(sizes).length === 0) return { error: `"${name}" necesita al menos un tamaño con precio.` };

    const groups = [];
    for (const g of Array.isArray(p.groups) ? p.groups : []) {
      if (!GROUP_IDS.includes(g?.id) || groups.some((x) => x.id === g.id)) return { error: `Opciones inválidas en "${name}".` };
      groups.push({ id: g.id, required: g.required === true });
    }

    products.push({ id, name, category, tag, description: description.value, image, sizes, groups, active: p.active !== false });
  }

  // Hours
  const hours = {};
  for (let day = 0; day <= 6; day++) {
    const h = input.hours?.[day];
    if (!h) {
      hours[day] = null;
      continue;
    }
    if (!TIME_RE.test(h.open) || !TIME_RE.test(h.close) || h.close <= h.open) {
      return { error: 'Revisa el horario: cada día abierto necesita hora de apertura y una hora de cierre posterior.' };
    }
    hours[day] = { open: h.open, close: h.close };
  }
  const lastOrderMinutes = Number(input.lastOrderMinutes);
  if (!Number.isInteger(lastOrderMinutes) || lastOrderMinutes < 0 || lastOrderMinutes > 120) {
    return { error: 'Los minutos antes del cierre deben ser entre 0 y 120.' };
  }

  // Gallery
  if (!Array.isArray(input.gallery) || input.gallery.length > MAX_GALLERY) {
    return { error: `La galería puede tener hasta ${MAX_GALLERY} fotos.` };
  }
  const seenPhotos = new Set();
  const gallery = [];
  for (const g of input.gallery) {
    const id = text(g?.id, 60);
    if (!ID_RE.test(id) || seenPhotos.has(id)) return { error: 'Hay una foto de la galería con un identificador inválido.' };
    seenPhotos.add(id);
    const image = text(g.image, 400);
    if (!IMAGE_RE.test(image)) return { error: 'Hay una foto de la galería sin imagen válida.' };
    // The description is optional for the owner; fall back to the name.
    const alt = { en: text(g.alt?.en, 120) || 'Maybe Café', es: text(g.alt?.es, 120) || 'Maybe Café' };
    gallery.push({ id, image, alt, active: g.active !== false });
  }

  return { catalog: { version: Number(input.version) || 0, products, optionGroups, hours, lastOrderMinutes, gallery } };
}

// Catalogs saved before a section existed (e.g. the gallery) get the default
// for that section, so older saved data keeps working.
export function withDefaults(catalog, defaults) {
  return { ...catalog, gallery: Array.isArray(catalog.gallery) ? catalog.gallery : defaults.gallery };
}
