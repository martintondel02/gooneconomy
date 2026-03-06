import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export async function initRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log(`Connected to Redis at ${redisUrl}`);
  }
}
