import express from 'express';  // Importing express

// Importing APIs handlers
import {
saveSearchedProductHandler
} from '../controllers/searchedProductController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('', validateToken, saveSearchedProductHandler);


export default router;
