"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importing express
// Importing APIs handlers
const messageController_1 = require("../controllers/messageController");
// Importing Middleware for authentication/validation of tokens
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
// Initialize router
const router = express_1.default.Router();
router.get('', verifyToken_1.default, messageController_1.getMessagesHandler);
exports.default = router;
