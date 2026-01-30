"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Importing APIs handlers
const shoppingCartController_1 = require("../controllers/shoppingCartController");
// Importing Middleware for authentication/validation of tokens
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
// Initialize router
const router = express_1.default.Router();
router.delete('/clear', verifyToken_1.default, shoppingCartController_1.clearCartHandler);
router.post('/add-to-cart', verifyToken_1.default, shoppingCartController_1.addToCartHandler);
router.get('', verifyToken_1.default, shoppingCartController_1.getCartProductsHandler);
router.put('/:id', verifyToken_1.default, shoppingCartController_1.updateCartProductHandler);
router.delete('/:id', verifyToken_1.default, shoppingCartController_1.removeProductFromCartHandler);
router.get('/count', verifyToken_1.default, shoppingCartController_1.getCartCountHandler);
exports.default = router;
