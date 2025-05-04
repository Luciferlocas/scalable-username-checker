"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.getAllUsernames = getAllUsernames;
exports.checkUsernameInDatabase = checkUsernameInDatabase;
exports.addUsernameToDatabase = addUsernameToDatabase;
const mongodb_1 = require("mongodb");
let client;
let db;
let usernameCollection;
async function connectToDatabase() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/username_db";
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db();
        usernameCollection = db.collection("usernames");
        await usernameCollection.createIndex({ username: 1 }, { unique: true });
        console.log("Database initialized with indexes");
    }
    catch (error) {
        console.error("Failed to connect to database", error);
        throw error;
    }
}
async function getAllUsernames() {
    try {
        const users = await usernameCollection.find({}).toArray();
        return users.map((user) => user.username);
    }
    catch (error) {
        console.error("Failed to get all usernames", error);
        throw error;
    }
}
async function checkUsernameInDatabase(username) {
    try {
        const normalizedUsername = username.toLowerCase();
        const result = await usernameCollection.findOne({
            username: normalizedUsername,
        });
        console.debug(`Database check for "${username}": ${result ? "exists" : "available"}`);
        return !!result;
    }
    catch (error) {
        console.error(`Error checking username in database: ${username}`, error);
        throw error;
    }
}
async function addUsernameToDatabase(username) {
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
    }
    catch (error) {
        console.error(`Error adding username to database: ${username}`, error);
        throw error;
    }
}
