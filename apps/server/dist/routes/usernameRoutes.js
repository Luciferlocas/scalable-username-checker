"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usernameController_1 = require("../controllers/usernameController");
const router = express_1.default.Router();
router.get("/username/:username", usernameController_1.checkUsername);
router.post("/username", usernameController_1.createUsername);
router.get("/usernames", usernameController_1.getAllUsernamesInDatabase);
exports.default = router;
