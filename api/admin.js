import { put } from '@vercel/blob';
import { getCatalog, getRedis, saveCatalog } from './_lib/catalogStore.js';
import {
  checkPassword,
  clearSessionCookie,
  isAuthenticated,
  isConfigured,
  setSessionCookie,
  tooManyAttempts,
} from './_lib/adminAuth.js';
import { slugify, validateCatalog } from '../src/data/catalog.js';

// Everything the /admin panel needs, behind one function (Vercel's Hobby plan
// caps the number of functions): POST /api/admin?action=login|logout|session|save|upload.
// Uploaded photos are already resized to a small JPEG in the browser.
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

async function login(req, res) {
  if (!isConfigured()) {
    res.status(503).json({ error: 'El panel no está configurado: falta ADMIN_PASSWORD en Vercel.' });
    return;
  }
  if (await tooManyAttempts(req)) {
    res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' });
    return;
  }
  if (!checkPassword(req.body?.password)) {
    res.status(401).json({ error: 'Contraseña incorrecta.' });
    return;
  }
  setSessionCookie(res);
  res.status(200).json({ ok: true });
}

async function session(req, res) {
  res.status(200).json({
    catalog: await getCatalog(),
    storage: { database: Boolean(getRedis()), images: Boolean(process.env.BLOB_READ_WRITE_TOKEN) },
  });
}

async function save(req, res) {
  const expectedVersion = Number(req.body?.catalog?.version) || 0;
  const { catalog, error } = validateCatalog(req.body?.catalog);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const result = await saveCatalog(catalog, expectedVersion);
  if (result.conflict) {
    res.status(409).json({ error: 'Alguien más guardó cambios mientras editabas. Recarga la página para ver la versión más reciente.' });
    return;
  }
  if (result.error) {
    res.status(503).json({ error: result.error });
    return;
  }
  res.status(200).json({ catalog: result.catalog });
}

async function upload(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(503).json({ error: 'El almacenamiento de fotos no está configurado todavía.' });
    return;
  }
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(req.body?.dataUrl || '');
  const buffer = match ? Buffer.from(match[1], 'base64') : null;
  // JPEG files start with FF D8 FF.
  if (!buffer || buffer.length > MAX_IMAGE_BYTES || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    res.status(400).json({ error: 'La foto no es válida o es demasiado grande.' });
    return;
  }
  const name = slugify(req.body?.name) || 'foto';
  const blob = await put(`menu/${name}.jpg`, buffer, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: true });
  res.status(200).json({ url: blob.url });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  // The custom header can't be sent cross-site without a CORS preflight we
  // never approve — an extra guard on top of the SameSite=Strict cookie.
  if (req.headers['x-maybe-admin'] !== '1') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const action = req.query.action;
  try {
    if (action === 'login') return await login(req, res);
    if (action === 'logout') {
      clearSessionCookie(res);
      res.status(200).json({ ok: true });
      return;
    }
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Tu sesión expiró. Vuelve a entrar.', code: 'UNAUTHENTICATED' });
      return;
    }
    if (action === 'session') return await session(req, res);
    if (action === 'save') return await save(req, res);
    if (action === 'upload') return await upload(req, res);
    res.status(400).json({ error: 'Acción desconocida.' });
  } catch (err) {
    console.error(`admin ${action} error:`, err);
    res.status(500).json({ error: 'Error inesperado del servidor.' });
  }
}
