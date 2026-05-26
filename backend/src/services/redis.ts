import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

// --- Upstash REST client (for caching) ---
export const upstash = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// --- ioredis TLS client (for BullMQ — needs Redis protocol) ---
const UPSTASH_REDIS_URL =
  process.env.UPSTASH_REDIS_URL ||
  `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${
    (process.env.UPSTASH_REDIS_REST_URL || '').replace('https://', '')
  }:6379`;

export const redis = new Redis(UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

redis.on('error', (err) => console.error('[Redis] ioredis error:', err.message));
redis.on('connect', () => console.log('[Redis] ioredis connected (BullMQ)'));

// --- Cache helpers (use Upstash REST) ---
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await upstash.get<T>(key);
    return val ?? null;
  } catch (err) {
    console.warn('[Cache] GET failed:', err);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    await upstash.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn('[Cache] SET failed:', err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await upstash.del(key);
  } catch (err) {
    console.warn('[Cache] DEL failed:', err);
  }
}
