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
    const normalizedUsername = username.toLowerCase();
    console.log(`Checking username availability for "${normalizedUsername}" on ${server}`);
    if (!(0, bloomFilterService_1.checkUsernameInBloomFilter)(normalizedUsername)) {
        const endTime = Date.now();
        console.log(`Username "${normalizedUsername}" not found in Bloom Filter. Likely available.`);
        return {
            username: normalizedUsername,
            available: true,
            source: "bloom_filter",
            checkTimeMs: endTime - startTime,
        };
    }
    const redisResult = await (0, redisService_1.checkUsernameInRedis)(normalizedUsername);
    if (redisResult !== null) {
        const endTime = Date.now();
        console.log(`Username "${normalizedUsername}" found in Redis cache. Available: ${!redisResult}`);
        let suggestions;
        if (!redisResult) {
            suggestions = undefined;
        }
        else {
            suggestions = (0, trieService_1.generateUsernameSuggestions)(normalizedUsername, 5);
        }
        return {
            username: normalizedUsername,
            available: !redisResult,
            source: "redis_cache",
            checkTimeMs: endTime - startTime,
            suggestions,
        };
    }
    if ((0, trieService_1.checkUsernameInTrie)(normalizedUsername)) {
        const suggestions = (0, trieService_1.generateUsernameSuggestions)(normalizedUsername, 5);
        const endTime = Date.now();
        console.log(`Username "${normalizedUsername}" found in Trie. Suggesting alternatives.`);
        await (0, redisService_1.cacheUsername)(normalizedUsername, true);
        return {
            username: normalizedUsername,
            available: false,
            source: "trie",
            suggestions,
            checkTimeMs: endTime - startTime,
        };
    }
    const exists = await (0, databaseService_1.checkUsernameInDatabase)(normalizedUsername);
    const endTime = Date.now();
    console.log(`Username "${normalizedUsername}" database check. Exists: ${exists}`);
    if (exists) {
        await (0, redisService_1.cacheUsername)(normalizedUsername, true);
        (0, trieService_1.addUsernameToTrie)(normalizedUsername);
        (0, bloomFilterService_1.addUsernameToBloomFilter)(normalizedUsername);
        return {
            username: normalizedUsername,
            available: false,
            source: "database",
            suggestions: (0, trieService_1.generateUsernameSuggestions)(normalizedUsername, 5),
            checkTimeMs: endTime - startTime,
        };
    }
    else {
        await (0, redisService_1.cacheUsername)(normalizedUsername, false);
        return {
            username: normalizedUsername,
            available: true,
            source: "database",
            checkTimeMs: endTime - startTime,
        };
    }
}
async function registerUsername(username) {
    try {
        const normalizedUsername = username.toLowerCase();
        console.log(`Attempting to register username: ${normalizedUsername}`);
        const availabilityCheck = await checkUsernameAvailability(normalizedUsername);
        if (!availabilityCheck.available) {
            return {
                success: false,
                message: `Username "${normalizedUsername}" is already taken`,
            };
        }
        const success = await (0, databaseService_1.addUsernameToDatabase)(normalizedUsername);
        if (success) {
            (0, bloomFilterService_1.addUsernameToBloomFilter)(normalizedUsername);
            (0, trieService_1.addUsernameToTrie)(normalizedUsername);
            await (0, redisService_1.cacheUsername)(normalizedUsername, true);
            console.log(`Successfully registered username: ${normalizedUsername}`);
            return {
                success: true,
                message: `Username "${normalizedUsername}" registered successfully`,
            };
        }
        else {
            console.error(`Failed to register username in database: ${normalizedUsername}`);
            return {
                success: false,
                message: `Failed to register username "${normalizedUsername}"`,
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
