import express from 'express';  // Importing express

// Importing APIs handlers
import {
    getMessagesHandler
} from '../controllers/messageController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.get('', validateToken, getMessagesHandler);

export default router;
