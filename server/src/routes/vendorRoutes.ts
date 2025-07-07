// EXTERNAL IMPORTS
import express from 'express';  // Importing express

// Importing APIs handlers
import {
    createVendorHandler,
    updateVendorHandler,
    getVendorHandler,
    getVendorsHandler,
    getVendorByIdHandler,
    getBanks,
    verifyBankAccount,
    getVendorOrdersHandler,
    getVendorBalanceHandler,
    withdrawFromVendorBalanceHandler,
    getVendorOrderCountHandler
} from '../controllers/vendorController';

// Importing Middleware for authentication/validation of tokens and user role
import validateToken from '../middleware/verifyToken';
// import checkIfVendor from '../middleware/checkIfVendor';
import checkUserRole from '../middleware/checkUserRole';

// Middleware for file upload
import { uploadVendorMiddleware } from '../middleware/multerConfig';



// Initialize router
const router = express.Router();

// Get a list of banks.
router.get('/banks', getBanks)

// Verify bank account
router.post('/verify-bank-account', verifyBankAccount);

// Get orders
router.get('/orders', validateToken,  getVendorOrdersHandler);

// Get balance
router.get('/balance', validateToken,  getVendorBalanceHandler);

// Initiate withdrawal
router.post('/withdraw', validateToken, withdrawFromVendorBalanceHandler);

// Get pending order count.
router.get('/orders/count', validateToken,  getVendorOrderCountHandler);

// router.post('/complete-vendor-profile', validateToken, checkIfVendor, createVendorHandler);
router.post('/create-vendor-profile', validateToken, checkUserRole('vendor'), uploadVendorMiddleware, createVendorHandler);
router.put('/update-vendor-profile', validateToken, uploadVendorMiddleware, updateVendorHandler);
router.get('/vendor-profile', validateToken, getVendorHandler);
router.get('', validateToken,  getVendorsHandler);
// router.get('', validateToken, checkUserRole('admin'), getVendorsHandler);
// router.get('/:id', validateToken, checkUserRole('admin'), getVendorByIdHandler);
router.get('/:id', getVendorByIdHandler);



export default router;