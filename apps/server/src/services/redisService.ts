import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisClient: Redis;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASS,
      lazyConnect: true,
    });

    await redisClient.connect();

    redisClient.on("error", (err) => {
      logger.error("Redis error", err);
    });

    redisClient.on("connect", () => {
      logger.info("Connected to Redis");
    });

    await redisClient.ping();
    logger.info("Redis connection tested successfully");
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
    throw error;
  }
}

export async function checkUsernameInRedis(
  username: string,
): Promise<boolean | null> {
  try {
    const normalizedUsername = username.toLowerCase();
    const result = await redisClient.get(`username:${normalizedUsername}`);

    logger.debug(
      `Redis cache check for "${username}": ${result ? "found" : "not found"}`,
    );

    return result ? true : null;
  } catch (error) {
    logger.error(`Error checking username in Redis: ${username}`, error);
    return null;
  }
}

export async function cacheUsername(
  username: string,
  exists: boolean,
): Promise<void> {
  try {
    const normalizedUsername = username.toLowerCase();
    await redisClient.set(
      `username:${normalizedUsername}`,
      exists ? "1" : "0",
      "EX",
      3600,
    );
    logger.debug(`Cached username "${username}" with exists=${exists}`);
  } catch (error) {
    logger.error(`Error caching username: ${username}`, error);
  }
}
