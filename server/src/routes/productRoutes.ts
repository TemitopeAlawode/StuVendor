// EXTERNAL IMPORTS
import express from 'express';  // Importing express

// Importing APIs handlers
import {
    createProductHandler,
    getProductsHandler,
    getProductByIdHandler,
    updateProductHandler,
    deleteProductHandler,
    getProductsByVendorIdHandler,
    indexAllProductsHandler
} from '../controllers/productController';

// Importing Middleware for authentication/validation of tokens and user role
import validateToken from '../middleware/verifyToken';
// import checkIfVendor from '../middleware/checkIfVendor';
import checkUserRole from '../middleware/checkUserRole';

// Middleware for file upload
import { uploadMiddleware } from '../middleware/multerConfig';

// Initialize router
const router = express.Router();

// Create/Add Product Route
router.post('/add-product', validateToken, checkUserRole('vendor'), uploadMiddleware, createProductHandler);

// View/Get Products Route
router.get('', getProductsHandler);

// Get Product by id Route
router.get('/:id', getProductByIdHandler);

// Update/Edit Product route
router.put('/edit/:id', validateToken, checkUserRole('vendor'), uploadMiddleware, updateProductHandler);

// Delete Product route
router.delete('/:id', validateToken, checkUserRole('vendor'), deleteProductHandler);

// Get Product by Vendor Id Route
router.get('/vendor/:id', getProductsByVendorIdHandler);
// router.get('/vendor', validateToken, getProductsByVendorIdHandler);

// Index Products into Algolia
router.post('/index-all-products', validateToken, checkUserRole('admin'), indexAllProductsHandler); // Restrict to admins

export default router;