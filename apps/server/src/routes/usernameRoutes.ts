import express from "express";
import {
  checkUsername,
  createUsername,
  getAllUsernamesInDatabase,
} from "../controllers/usernameController";

const router = express.Router();

router.get("/username/:username", checkUsername);
router.post("/username", createUsername);
router.get("/usernames", getAllUsernamesInDatabase);

export default router;
