import express from 'express';

// Importing APIs handlers
import {
addToCartHandler,
getCartProductsHandler,
updateCartProductHandler,
removeProductFromCartHandler,
getCartCountHandler
} from '../controllers/shoppingCartController';


// Importing Middleware for authentication/validation of tokens
import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('/add-to-cart', validateToken, addToCartHandler);
router.get('', validateToken, getCartProductsHandler);
router.put('/:id', validateToken, updateCartProductHandler);
router.delete('/:id', validateToken, removeProductFromCartHandler);
router.get('/count', validateToken, getCartCountHandler);

export default router;