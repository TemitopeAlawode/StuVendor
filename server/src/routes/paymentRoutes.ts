import express from 'express';
import { 
    verifyPaymentHandler,
    splitPaymentHandler
 } from '../controllers/paymentController';

// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


const router = express.Router();


router.post('/verify', validateToken, verifyPaymentHandler);
router.post('/split', validateToken, splitPaymentHandler);



export default router;
