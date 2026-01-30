"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recommendationsController_1 = require("../controllers/recommendationsController");
// Importing Middleware for authentication/validation of tokens
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = express_1.default.Router();
router.get('/recommended-products', verifyToken_1.default, recommendationsController_1.getRecommendedProducts);
exports.default = router;
