// Password login for the /admin panel. The password lives only in the
// ADMIN_PASSWORD env var; a successful login sets an HttpOnly cookie holding
// an expiry time signed with a key derived from that password — so changing
// the password in Vercel instantly logs everyone out.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getRedis } from './catalogStore.js';

const COOKIE = 'maybe_admin';
const SESSION_DAYS = 7;
const MAX_ATTEMPTS = 8; // per IP, per 15 minutes

function signingKey() {
  return createHash('sha256').update(`maybe-admin:${process.env.ADMIN_PASSWORD}`).digest();
}

function sign(value) {
  return createHmac('sha256', signingKey()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(password) {
  if (!isConfigured() || typeof password !== 'string') return false;
  // Compare digests so the comparison is constant-time regardless of length.
  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

function readCookie(req) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : null;
}

export function isAuthenticated(req) {
  if (!isConfigured()) return false;
  const token = readCookie(req);
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}

function cookie(value, maxAgeSeconds) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function setSessionCookie(res) {
  const exp = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  res.setHeader('Set-Cookie', cookie(`${exp}.${sign(exp)}`, SESSION_DAYS * 24 * 60 * 60));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookie('', 0));
}

// Basic brute-force protection, only when Redis is available.
export async function tooManyAttempts(req) {
  const redis = getRedis();
  if (!redis) return false;
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const key = `maybe:login:${ip}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 15 * 60);
    return count > MAX_ATTEMPTS;
  } catch {
    return false;
  }
}
