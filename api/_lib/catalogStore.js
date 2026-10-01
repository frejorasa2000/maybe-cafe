// Where the editable catalog (menu, options, hours) lives: one JSON document
// in Upstash Redis. Falls back to the bundled default when Redis isn't
// configured or can't be reached, so the site and checkout keep working.
import { Redis } from '@upstash/redis';
import { DEFAULT_CATALOG } from '../../src/data/defaultCatalog.js';

const KEY = 'maybe:catalog';
const HISTORY_KEY = 'maybe:catalog:history';
const HISTORY_SIZE = 20;

let client;
export function getRedis() {
  if (client !== undefined) return client;
  // Vercel's Upstash integration exposes KV_REST_API_*; a direct Upstash
  // setup uses UPSTASH_REDIS_REST_*. Accept either.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export async function getCatalog() {
  const redis = getRedis();
  if (!redis) return DEFAULT_CATALOG;
  try {
    const stored = await redis.get(KEY);
    return stored && typeof stored === 'object' ? stored : DEFAULT_CATALOG;
  } catch (err) {
    console.error('Could not read catalog from Redis, using default:', err);
    return DEFAULT_CATALOG;
  }
}

// Atomic compare-and-set on the version number, so two people saving from
// the panel at once can't silently overwrite each other. The previous copy
// is kept in a short history list in case a change needs to be undone.
const SAVE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
local version = 0
if current then version = cjson.decode(current).version or 0 end
if tonumber(ARGV[1]) ~= version then return -1 end
if current then
  redis.call('LPUSH', KEYS[2], current)
  redis.call('LTRIM', KEYS[2], 0, tonumber(ARGV[3]) - 1)
end
redis.call('SET', KEYS[1], ARGV[2])
return version + 1
`;

// Returns { catalog } with the new version, { conflict: true }, or { error }.
export async function saveCatalog(catalog, expectedVersion) {
  const redis = getRedis();
  if (!redis) return { error: 'La base de datos no está configurada todavía.' };
  const next = { ...catalog, version: expectedVersion + 1, updatedAt: new Date().toISOString() };
  const result = await redis.eval(SAVE_SCRIPT, [KEY, HISTORY_KEY], [String(expectedVersion), JSON.stringify(next), String(HISTORY_SIZE)]);
  if (Number(result) === -1) return { conflict: true };
  return { catalog: next };
}
