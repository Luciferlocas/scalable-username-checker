"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBloomFilter = initBloomFilter;
exports.checkUsernameInBloomFilter = checkUsernameInBloomFilter;
exports.addUsernameToBloomFilter = addUsernameToBloomFilter;
const bloom_filters_1 = require("bloom-filters");
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
const databaseService_1 = require("./databaseService");
let bloomFilter;
async function initBloomFilter() {
    bloomFilter = new bloom_filters_1.BloomFilter(config_1.config.bloomFilter.size, config_1.config.bloomFilter.hashFunctions);
    try {
        const usernames = await (0, databaseService_1.getAllUsernames)();
        logger_1.logger.info(`Loading ${usernames.length} usernames into Bloom filter`);
        for (const username of usernames) {
            bloomFilter.add(username.toLowerCase());
        }
        logger_1.logger.info("Bloom filter successfully initialized");
    }
    catch (error) {
        logger_1.logger.error("Failed to initialize Bloom filter", error);
        throw error;
    }
}
function checkUsernameInBloomFilter(username) {
    const normalizedUsername = username.toLowerCase();
    const mightExist = bloomFilter.has(normalizedUsername);
    logger_1.logger.debug(`Bloom filter check for "${username}": ${mightExist ? "might exist" : "definitely available"}`);
    return mightExist;
}
function addUsernameToBloomFilter(username) {
    const normalizedUsername = username.toLowerCase();
    bloomFilter.add(normalizedUsername);
    logger_1.logger.debug(`Added "${username}" to Bloom filter`);
}
