import express from 'express';  // Importing express

// Importing APIs handlers
import {
createViewedProductHandler
} from '../controllers/viewedProductsController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('', validateToken, createViewedProductHandler);


export default router;
