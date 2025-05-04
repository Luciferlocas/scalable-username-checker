import { BloomFilter } from "bloom-filters";
import { config } from "../config/config";
import { logger } from "../utils/logger";
import { getAllUsernames } from "./databaseService";

let bloomFilter: BloomFilter;

export async function initBloomFilter(): Promise<void> {
  bloomFilter = new BloomFilter(
    config.bloomFilter.size,
    config.bloomFilter.hashFunctions,
  );

  try {
    const usernames = await getAllUsernames();
    logger.info(`Loading ${usernames.length} usernames into Bloom filter`);

    for (const username of usernames) {
      bloomFilter.add(username.toLowerCase());
    }

    logger.info("Bloom filter successfully initialized");
  } catch (error) {
    logger.error("Failed to initialize Bloom filter", error);
    throw error;
  }
}

export function checkUsernameInBloomFilter(username: string): boolean {
  const normalizedUsername = username.toLowerCase();
  const mightExist = bloomFilter.has(normalizedUsername);

  logger.debug(
    `Bloom filter check for "${username}": ${mightExist ? "might exist" : "definitely available"}`,
  );
  return mightExist;
}

export function addUsernameToBloomFilter(username: string): void {
  const normalizedUsername = username.toLowerCase();
  bloomFilter.add(normalizedUsername);
  logger.debug(`Added "${username}" to Bloom filter`);
}
