import express from 'express';  // Importing express

// Importing APIs handlers
import {
createOrderHandler
} from '../controllers/orderController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('', validateToken, createOrderHandler);


export default router;
