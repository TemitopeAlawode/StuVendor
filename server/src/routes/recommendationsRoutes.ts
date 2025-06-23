import express from 'express';
import { getRecommendedProducts } from '../controllers/recommendationsController';

// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';



const router = express.Router();

router.get('/recommended-products', validateToken, getRecommendedProducts);

export default router;
