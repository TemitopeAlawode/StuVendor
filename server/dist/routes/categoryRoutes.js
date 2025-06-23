"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express
const express_1 = __importDefault(require("express"));
// Importing API handlers
const categoryController_1 = require("../controllers/categoryController");
// Importing Middleware for authentication/validation of tokens and user role
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const checkUserRole_1 = __importDefault(require("../middleware/checkUserRole"));
// Initialize router
const router = express_1.default.Router();
router.post('/add-category', categoryController_1.createCategoryHandler);
router.get('', categoryController_1.getCategoriesHandler);
router.get('/:id', categoryController_1.getCategoryHandler);
router.put('/:id', verifyToken_1.default, (0, checkUserRole_1.default)('admin'), categoryController_1.updateCategoryHandler);
router.delete('/:id', verifyToken_1.default, (0, checkUserRole_1.default)('admin'), categoryController_1.deleteCategoryHandler);
exports.default = router;
