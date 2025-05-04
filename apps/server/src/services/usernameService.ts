import { UsernameCheckResult } from "../models/username";
import {
  checkUsernameInBloomFilter,
  addUsernameToBloomFilter,
} from "./bloomFilterService";
import { checkUsernameInRedis, cacheUsername } from "./redisService";
import {
  checkUsernameInTrie,
  addUsernameToTrie,
  generateUsernameSuggestions,
} from "./trieService";
import {
  checkUsernameInDatabase,
  addUsernameToDatabase,
} from "./databaseService";
import { getNextServer } from "./loadBalancerService";

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameCheckResult> {
  const startTime = Date.now();
  const server = getNextServer();
  const normalizedUsername = username.toLowerCase();

  console.log(
    `Checking username availability for "${normalizedUsername}" on ${server}`,
  );

  if (!checkUsernameInBloomFilter(normalizedUsername)) {
    const endTime = Date.now();
    console.log(
      `Username "${normalizedUsername}" not found in Bloom Filter. Likely available.`,
    );
    return {
      username: normalizedUsername,
      available: true,
      source: "bloom_filter",
      checkTimeMs: endTime - startTime,
    };
  }

  const redisResult = await checkUsernameInRedis(normalizedUsername);
  if (redisResult !== null) {
    const endTime = Date.now();
    console.log(
      `Username "${normalizedUsername}" found in Redis cache. Available: ${!redisResult}`,
    );

    let suggestions;
    if (!redisResult) {
      suggestions = undefined;
    } else {
      suggestions = generateUsernameSuggestions(normalizedUsername, 5);
    }

    return {
      username: normalizedUsername,
      available: !redisResult,
      source: "redis_cache",
      checkTimeMs: endTime - startTime,
      suggestions,
    };
  }

  if (checkUsernameInTrie(normalizedUsername)) {
    const suggestions = generateUsernameSuggestions(normalizedUsername, 5);
    const endTime = Date.now();

    console.log(
      `Username "${normalizedUsername}" found in Trie. Suggesting alternatives.`,
    );
    await cacheUsername(normalizedUsername, true);

    return {
      username: normalizedUsername,
      available: false,
      source: "trie",
      suggestions,
      checkTimeMs: endTime - startTime,
    };
  }

  const exists = await checkUsernameInDatabase(normalizedUsername);
  const endTime = Date.now();

  console.log(
    `Username "${normalizedUsername}" database check. Exists: ${exists}`,
  );

  if (exists) {
    await cacheUsername(normalizedUsername, true);
    addUsernameToTrie(normalizedUsername);
    addUsernameToBloomFilter(normalizedUsername);

    return {
      username: normalizedUsername,
      available: false,
      source: "database",
      suggestions: generateUsernameSuggestions(normalizedUsername, 5),
      checkTimeMs: endTime - startTime,
    };
  } else {
    await cacheUsername(normalizedUsername, false);

    return {
      username: normalizedUsername,
      available: true,
      source: "database",
      checkTimeMs: endTime - startTime,
    };
  }
}

export async function registerUsername(
  username: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedUsername = username.toLowerCase();
    console.log(`Attempting to register username: ${normalizedUsername}`);

    const availabilityCheck =
      await checkUsernameAvailability(normalizedUsername);

    if (!availabilityCheck.available) {
      return {
        success: false,
        message: `Username "${normalizedUsername}" is already taken`,
      };
    }

    const success = await addUsernameToDatabase(normalizedUsername);

    if (success) {
      addUsernameToBloomFilter(normalizedUsername);
      addUsernameToTrie(normalizedUsername);
      await cacheUsername(normalizedUsername, true);

      console.log(`Successfully registered username: ${normalizedUsername}`);
      return {
        success: true,
        message: `Username "${normalizedUsername}" registered successfully`,
      };
    } else {
      console.error(
        `Failed to register username in database: ${normalizedUsername}`,
      );
      return {
        success: false,
        message: `Failed to register username "${normalizedUsername}"`,
      };
    }
  } catch (error) {
    console.error(`Error registering username: ${username}`, error);
    return {
      success: false,
      message: `Error registering username: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
