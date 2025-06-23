"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXTERNAL IMPORTS
const express_1 = __importDefault(require("express")); // Importing express
// Importing APIs handlers
const productController_1 = require("../controllers/productController");
// Importing Middleware for authentication/validation of tokens and user role
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
// import checkIfVendor from '../middleware/checkIfVendor';
const checkUserRole_1 = __importDefault(require("../middleware/checkUserRole"));
// Middleware for file upload
const multerConfig_1 = require("../middleware/multerConfig");
// Initialize router
const router = express_1.default.Router();
// Create/Add Product Route
router.post('/add-product', verifyToken_1.default, (0, checkUserRole_1.default)('vendor'), multerConfig_1.uploadMiddleware, productController_1.createProductHandler);
// View/Get Products Route
router.get('', productController_1.getProductsHandler);
// Get Product by id Route
router.get('/:id', productController_1.getProductByIdHandler);
// Update/Edit Product route
router.put('/edit/:id', verifyToken_1.default, (0, checkUserRole_1.default)('vendor'), multerConfig_1.uploadMiddleware, productController_1.updateProductHandler);
// Delete Product route
router.delete('/:id', verifyToken_1.default, (0, checkUserRole_1.default)('vendor'), productController_1.deleteProductHandler);
// Get Product by Vendor Id Route
router.get('/vendor/:id', productController_1.getProductsByVendorIdHandler);
// router.get('/vendor', validateToken, getProductsByVendorIdHandler);
// Index Products into Algolia
router.get('/index-all-products', verifyToken_1.default, productController_1.indexAllProductsHandler); // Restrict to admins
exports.default = router;
