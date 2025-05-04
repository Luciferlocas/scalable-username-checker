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
import { logger } from "../utils/logger";

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameCheckResult> {
  const startTime = Date.now();
  const server = getNextServer();

  logger.info(`Checking username availability for "${username}" on ${server}`);

  if (!checkUsernameInBloomFilter(username)) {
    const endTime = Date.now();
    return {
      username,
      available: true,
      source: "bloom_filter",
      checkTimeMs: endTime - startTime,
    };
  }

  const redisResult = await checkUsernameInRedis(username);
  if (redisResult !== null) {
    const endTime = Date.now();
    return {
      username,
      available: !redisResult,
      source: "redis_cache",
      checkTimeMs: endTime - startTime,
    };
  }

  if (checkUsernameInTrie(username)) {
    const suggestions = generateUsernameSuggestions(username, 5);
    const endTime = Date.now();

    await cacheUsername(username, true);

    return {
      username,
      available: false,
      source: "trie",
      suggestions,
      checkTimeMs: endTime - startTime,
    };
  }

  const exists = await checkUsernameInDatabase(username);
  const endTime = Date.now();

  await cacheUsername(username, exists);

  if (exists) {
    addUsernameToTrie(username);
  }

  return {
    username,
    available: !exists,
    source: "database",
    suggestions: exists ? generateUsernameSuggestions(username, 5) : undefined,
    checkTimeMs: endTime - startTime,
  };
}

export async function registerUsername(
  username: string,
): Promise<{ success: boolean; message: string }> {
  try {
    logger.info(`Attempting to register username: ${username}`);

    const availabilityCheck = await checkUsernameAvailability(username);

    if (!availabilityCheck.available) {
      return {
        success: false,
        message: `Username "${username}" is already taken`,
      };
    }

    const success = await addUsernameToDatabase(username);

    if (success) {
      addUsernameToBloomFilter(username);
      addUsernameToTrie(username);
      await cacheUsername(username, true);

      return {
        success: true,
        message: `Username "${username}" registered successfully`,
      };
    } else {
      return {
        success: false,
        message: `Failed to register username "${username}"`,
      };
    }
  } catch (error) {
    logger.error(`Error registering username: ${username}`, error);
    return {
      success: false,
      message: `Error registering username: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
