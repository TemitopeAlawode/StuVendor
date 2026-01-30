"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
// Importing Middleware for authentication/validation of tokens
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = express_1.default.Router();
router.post('/verify', verifyToken_1.default, paymentController_1.verifyPaymentHandler);
router.post('/split', verifyToken_1.default, paymentController_1.splitPaymentHandler);
exports.default = router;
