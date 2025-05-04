"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.checkUsernameInRedis = checkUsernameInRedis;
exports.cacheUsername = cacheUsername;
const ioredis_1 = __importDefault(require("ioredis"));
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
            console.error("Redis error", err);
        });
        redisClient.on("connect", () => {
            console.log("Connected to Redis");
        });
        await redisClient.ping();
        console.log("Redis connection tested successfully");
    }
    catch (error) {
        console.error("Failed to connect to Redis", error);
        throw error;
    }
}
async function checkUsernameInRedis(username) {
    try {
        const normalizedUsername = username.toLowerCase();
        const result = await redisClient.get(`username:${normalizedUsername}`);
        console.debug(`Redis cache check for "${username}": ${result ? "found" : "not found"}`);
        return result ? true : null;
    }
    catch (error) {
        console.error(`Error checking username in Redis: ${username}`, error);
        return null;
    }
}
async function cacheUsername(username, exists) {
    try {
        const normalizedUsername = username.toLowerCase();
        await redisClient.set(`username:${normalizedUsername}`, exists ? "1" : "0", "EX", 3600);
        console.debug(`Cached username "${username}" with exists=${exists}`);
    }
    catch (error) {
        console.error(`Error caching username: ${username}`, error);
    }
}
