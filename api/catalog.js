import { getCatalog } from './_lib/catalogStore.js';

// Public, read-only catalog for the site. Briefly cached at the edge so a
// busy page doesn't hit Redis on every view, while the owner's changes still
// show up within seconds.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const catalog = await getCatalog();
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
  res.status(200).json(catalog);
}
