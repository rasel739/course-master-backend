import { createClient, RedisClientType } from 'redis';
import config from '.';

let redisClient: RedisClientType | null;

export const connectRedis = async () => {
  if (!config.redis.url) {
    console.warn('Redis URL not provided, caching disabled');
    return null;
  }

  try {
    redisClient = createClient({ url: config.redis.url });

    redisClient.on('error', err => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log(' Redis Connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Redis Connection Error';
    console.error(errorMessage);
    return null;
  }
};

export const getRedisClient = () => redisClient;
