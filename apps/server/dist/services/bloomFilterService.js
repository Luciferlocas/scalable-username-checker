"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBloomFilter = initBloomFilter;
exports.checkUsernameInBloomFilter = checkUsernameInBloomFilter;
exports.addUsernameToBloomFilter = addUsernameToBloomFilter;
const bloom_filters_1 = require("bloom-filters");
const config_1 = require("../config/config");
const databaseService_1 = require("./databaseService");
let bloomFilter;
async function initBloomFilter() {
    bloomFilter = new bloom_filters_1.BloomFilter(config_1.config.bloomFilter.size, config_1.config.bloomFilter.hashFunctions);
    try {
        const usernames = await (0, databaseService_1.getAllUsernames)();
        console.log(`Loading ${usernames.length} usernames into Bloom filter`);
        for (const username of usernames) {
            bloomFilter.add(username.toLowerCase());
        }
        console.log("Bloom filter successfully initialized");
    }
    catch (error) {
        console.error("Failed to initialize Bloom filter", error);
        throw error;
    }
}
function checkUsernameInBloomFilter(username) {
    const normalizedUsername = username.toLowerCase();
    const mightExist = bloomFilter.has(normalizedUsername);
    console.debug(`Bloom filter check for "${username}": ${mightExist ? "might exist" : "definitely available"}`);
    return mightExist;
}
function addUsernameToBloomFilter(username) {
    const normalizedUsername = username.toLowerCase();
    bloomFilter.add(normalizedUsername);
    console.debug(`Added "${username}" to Bloom filter`);
}
