import express from 'express';  // Importing express

// Importing APIs handlers
import {
    likeProductHandler,
    unlikeProductHandler,
    getLikedProductsHandler
} from '../controllers/likedProductController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('', validateToken, likeProductHandler);
router.delete('/:productId', validateToken, unlikeProductHandler);
router.get('', validateToken, getLikedProductsHandler);

export default router;
