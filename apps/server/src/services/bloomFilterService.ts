import { BloomFilter } from "bloom-filters";
import { config } from "../config/config";
import { getAllUsernames } from "./databaseService";

let bloomFilter: BloomFilter;

export async function initBloomFilter(): Promise<void> {
  bloomFilter = new BloomFilter(
    config.bloomFilter.size,
    config.bloomFilter.hashFunctions,
  );

  try {
    const usernames = await getAllUsernames();
    console.log(`Loading ${usernames.length} usernames into Bloom filter`);

    for (const username of usernames) {
      bloomFilter.add(username.toLowerCase());
    }

    console.log("Bloom filter successfully initialized");
  } catch (error) {
    console.error("Failed to initialize Bloom filter", error);
    throw error;
  }
}

export function checkUsernameInBloomFilter(username: string): boolean {
  const normalizedUsername = username.toLowerCase();
  const mightExist = bloomFilter.has(normalizedUsername);

  console.debug(
    `Bloom filter check for "${username}": ${mightExist ? "might exist" : "definitely available"}`,
  );
  return mightExist;
}

export function addUsernameToBloomFilter(username: string): void {
  const normalizedUsername = username.toLowerCase();
  bloomFilter.add(normalizedUsername);
  console.debug(`Added "${username}" to Bloom filter`);
}
