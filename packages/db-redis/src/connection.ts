import RedisPkg from "ioredis";

const Redis = (RedisPkg as any).default ?? RedisPkg;

/**
 * Resolve Redis URL
 */
// const redisUrl =
//   process.env.REDIS_URI ||
//   process.env.REDIS_URL ||
//   "redis://127.0.0.1:6379";

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

/**
 * Singleton Redis instance
 */
let redis: InstanceType<typeof Redis> | null = null;

/**
 * Create Redis client (Upstash compatible)
 */
const createRedisClient = () => {
  const redisUrl = getEnv("REDIS_URI");

  const client = new Redis(redisUrl, {
    tls: redisUrl.startsWith("rediss://")
      ? { rejectUnauthorized: false }
      : undefined,

    // Prevent infinite retries
    maxRetriesPerRequest: 3,

    // Avoid blocking startup
    enableReadyCheck: true,

    // Backoff strategy
    retryStrategy: (times: any) => {
      if (times > 5) return null; // stop retrying
      return Math.min(times * 200, 2000);
    },
  });

  client.on("connect", () => {
    console.log("[redis] connected");
  });

  client.on("ready", () => {
    console.log("[redis] ready");
  });

  client.on("error", (err: Error) => {
    console.error("[redis]", err.message);
  });

  client.on("close", () => {
    console.warn("[redis] connection closed");
  });

  return client;
};

/**
 * Lazy Redis getter
 * Redis will connect ONLY when used
 */
export const getRedis = () => {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
};

/**
 * Optional: graceful shutdown
 */
export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("[redis] disconnected");
  }
};
