"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.checkUsernameInRedis = checkUsernameInRedis;
exports.cacheUsername = cacheUsername;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
let redisClient;
async function connectRedis() {
    try {
        redisClient = new ioredis_1.default({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASS,
            lazyConnect: true,
        });
        await redisClient.connect();
        redisClient.on("error", (err) => {
            logger_1.logger.error("Redis error", err);
        });
        redisClient.on("connect", () => {
            logger_1.logger.info("Connected to Redis");
        });
        await redisClient.ping();
        logger_1.logger.info("Redis connection tested successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to Redis", error);
        throw error;
    }
}
async function checkUsernameInRedis(username) {
    try {
        const normalizedUsername = username.toLowerCase();
        const result = await redisClient.get(`username:${normalizedUsername}`);
        logger_1.logger.debug(`Redis cache check for "${username}": ${result ? "found" : "not found"}`);
        return result ? true : null;
    }
    catch (error) {
        logger_1.logger.error(`Error checking username in Redis: ${username}`, error);
        return null;
    }
}
async function cacheUsername(username, exists) {
    try {
        const normalizedUsername = username.toLowerCase();
        await redisClient.set(`username:${normalizedUsername}`, exists ? "1" : "0", "EX", 3600);
        logger_1.logger.debug(`Cached username "${username}" with exists=${exists}`);
    }
    catch (error) {
        logger_1.logger.error(`Error caching username: ${username}`, error);
    }
}
