// Receives the trace of a failed Apple Pay / Google Pay attempt from the
// checkout (see src/utils/walletTrace.js) and keeps the latest ones in Redis
// for the "Diagnóstico de pagos" tab of /admin. No customer details are sent
// and the IP is only used for the rate limit, never stored with the entry.
import { getRedis } from './_lib/catalogStore.js';

export const WALLET_LOG_KEY = 'maybe:wallet-log';
const MAX_ENTRIES = 50;
const MAX_CHARS = 6000;
const MAX_PER_IP = 20; // per hour

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { wallet, trace } = req.body || {};
  if (typeof trace !== 'string' || !trace.trim() || !['applePay', 'googlePay'].includes(wallet)) {
    res.status(400).json({ error: 'Invalid log.' });
    return;
  }

  const entry = { at: new Date().toISOString(), wallet, trace: trace.slice(0, MAX_CHARS) };
  console.warn('wallet-log:', JSON.stringify(entry));

  const redis = getRedis();
  if (redis) {
    try {
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
      const rateKey = `maybe:wallet-log:${ip}`;
      const count = await redis.incr(rateKey);
      if (count === 1) await redis.expire(rateKey, 60 * 60);
      if (count <= MAX_PER_IP) {
        await redis.lpush(WALLET_LOG_KEY, entry);
        await redis.ltrim(WALLET_LOG_KEY, 0, MAX_ENTRIES - 1);
      }
    } catch (err) {
      console.error('wallet-log store error:', err);
    }
  }
  res.status(200).json({ ok: true });
}
