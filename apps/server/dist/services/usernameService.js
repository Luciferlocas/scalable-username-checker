"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsernameAvailability = checkUsernameAvailability;
exports.registerUsername = registerUsername;
const bloomFilterService_1 = require("./bloomFilterService");
const redisService_1 = require("./redisService");
const trieService_1 = require("./trieService");
const databaseService_1 = require("./databaseService");
const loadBalancerService_1 = require("./loadBalancerService");
async function checkUsernameAvailability(username) {
    const startTime = Date.now();
    const server = (0, loadBalancerService_1.getNextServer)();
    console.log(`Checking username availability for "${username}" on ${server}`);
    if (!(0, bloomFilterService_1.checkUsernameInBloomFilter)(username)) {
        const endTime = Date.now();
        return {
            username,
            available: true,
            source: "bloom_filter",
            checkTimeMs: endTime - startTime,
        };
    }
    const redisResult = await (0, redisService_1.checkUsernameInRedis)(username);
    if (redisResult !== null) {
        const endTime = Date.now();
        return {
            username,
            available: !redisResult,
            source: "redis_cache",
            checkTimeMs: endTime - startTime,
        };
    }
    if ((0, trieService_1.checkUsernameInTrie)(username)) {
        const suggestions = (0, trieService_1.generateUsernameSuggestions)(username, 5);
        const endTime = Date.now();
        await (0, redisService_1.cacheUsername)(username, true);
        return {
            username,
            available: false,
            source: "trie",
            suggestions,
            checkTimeMs: endTime - startTime,
        };
    }
    const exists = await (0, databaseService_1.checkUsernameInDatabase)(username);
    const endTime = Date.now();
    await (0, redisService_1.cacheUsername)(username, exists);
    if (exists) {
        (0, trieService_1.addUsernameToTrie)(username);
    }
    return {
        username,
        available: !exists,
        source: "database",
        suggestions: exists ? (0, trieService_1.generateUsernameSuggestions)(username, 5) : undefined,
        checkTimeMs: endTime - startTime,
    };
}
async function registerUsername(username) {
    try {
        console.log(`Attempting to register username: ${username}`);
        const availabilityCheck = await checkUsernameAvailability(username);
        if (!availabilityCheck.available) {
            return {
                success: false,
                message: `Username "${username}" is already taken`,
            };
        }
        const success = await (0, databaseService_1.addUsernameToDatabase)(username);
        if (success) {
            (0, bloomFilterService_1.addUsernameToBloomFilter)(username);
            (0, trieService_1.addUsernameToTrie)(username);
            await (0, redisService_1.cacheUsername)(username, true);
            return {
                success: true,
                message: `Username "${username}" registered successfully`,
            };
        }
        else {
            return {
                success: false,
                message: `Failed to register username "${username}"`,
            };
        }
    }
    catch (error) {
        console.error(`Error registering username: ${username}`, error);
        return {
            success: false,
            message: `Error registering username: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
