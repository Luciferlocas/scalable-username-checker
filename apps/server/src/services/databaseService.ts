import { MongoClient, Collection, Db } from "mongodb";
import { Username } from "../models/username";

let client: MongoClient;
let db: Db;
let usernameCollection: Collection<Username>;

export async function connectToDatabase(): Promise<void> {
  try {
    const uri =
      process.env.MONGO_URI || "mongodb://localhost:27017/username_db";
    client = new MongoClient(uri);

    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db();
    usernameCollection = db.collection<Username>("usernames");

    await usernameCollection.createIndex({ username: 1 }, { unique: true });

    console.log("Database initialized with indexes");
  } catch (error) {
    console.error("Failed to connect to database", error);
    throw error;
  }
}

export async function getAllUsernames(): Promise<string[]> {
  try {
    const users = await usernameCollection.find({}).toArray();
    return users.map((user) => user.username);
  } catch (error) {
    console.error("Failed to get all usernames", error);
    throw error;
  }
}

export async function checkUsernameInDatabase(
  username: string,
): Promise<boolean> {
  try {
    const normalizedUsername = username.toLowerCase();
    const result = await usernameCollection.findOne({
      username: normalizedUsername,
    });

    console.debug(
      `Database check for "${username}": ${result ? "exists" : "available"}`,
    );
    return !!result;
  } catch (error) {
    console.error(`Error checking username in database: ${username}`, error);
    throw error;
  }
}

export async function addUsernameToDatabase(
  username: string,
): Promise<boolean> {
  try {
    const normalizedUsername = username.toLowerCase();

    const existingUser = await usernameCollection.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      console.debug(`Username "${username}" already exists in database`);
      return false;
    }

    await usernameCollection.insertOne({
      username: normalizedUsername,
      created_at: new Date(),
      status: "active",
    });

    console.debug(`Added "${username}" to database`);
    return true;
  } catch (error) {
    console.error(`Error adding username to database: ${username}`, error);
    throw error;
  }
}
