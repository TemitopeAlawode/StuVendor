"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXTERNAL IMPORTS
const express_1 = __importDefault(require("express")); // Importing express
// Importing APIs handlers
const vendorController_1 = require("../controllers/vendorController");
// Importing Middleware for authentication/validation of tokens and user role
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
// import checkIfVendor from '../middleware/checkIfVendor';
const checkUserRole_1 = __importDefault(require("../middleware/checkUserRole"));
// Middleware for file upload
const multerConfig_1 = require("../middleware/multerConfig");
// Initialize router
const router = express_1.default.Router();
// router.post('/complete-vendor-profile', validateToken, checkIfVendor, createVendorHandler);
router.post('/create-vendor-profile', verifyToken_1.default, (0, checkUserRole_1.default)('vendor'), multerConfig_1.uploadVendorMiddleware, vendorController_1.createVendorHandler);
router.put('/update-vendor-profile', verifyToken_1.default, multerConfig_1.uploadVendorMiddleware, vendorController_1.updateVendorHandler);
router.get('/vendor-profile', verifyToken_1.default, vendorController_1.getVendorHandler);
router.get('', verifyToken_1.default, (0, checkUserRole_1.default)('admin'), vendorController_1.getVendorsHandler);
// router.get('/:id', validateToken, checkUserRole('admin'), getVendorByIdHandler);
router.get('/:id', vendorController_1.getVendorByIdHandler);
exports.default = router;
