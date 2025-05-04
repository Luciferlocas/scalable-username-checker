import { Request, Response } from "express";
import {
  checkUsernameAvailability,
  registerUsername,
} from "../services/usernameService";
import { getAllUsernames } from "../services/databaseService";

export async function checkUsername(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      res.status(400).json({
        error:
          "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens.",
      });
      return;
    }

    const result = await checkUsernameAvailability(username);

    res.json(result);
  } catch (error) {
    console.error("Error checking username", error);
    res.status(500).json({
      error: "Failed to check username availability",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function createUsername(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { username } = req.body;

    if (!username || username.trim() === "") {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      res.status(400).json({
        error:
          "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens.",
      });
      return;
    }

    const result = await registerUsername(username);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(409).json(result);
    }
  } catch (error) {
    console.error("Error creating username", error);
    res.status(500).json({
      error: "Failed to register username",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAllUsernamesInDatabase(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const usernames = await getAllUsernames();
    res.json({ usernames });
  } catch (error) {
    console.error("Error getting all usernames", error);
    res.status(500).json({
      error: "Failed to get usernames",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
