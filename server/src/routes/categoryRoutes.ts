// Importing express
import express from 'express';

// Importing API handlers
import {
    createCategoryHandler,
    getCategoriesHandler,
    getCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler
} from '../controllers/categoryController';


// Importing Middleware for authentication/validation of tokens and user role
import verifyToken from '../middleware/verifyToken';
import checkUserRole from '../middleware/checkUserRole';

// Initialize router
const router = express.Router();

router.post('/add-category', createCategoryHandler);
router.get('', getCategoriesHandler);
router.get('/:id', getCategoryHandler);
router.put('/:id', verifyToken, checkUserRole('admin'), updateCategoryHandler);
router.delete('/:id', verifyToken, checkUserRole('admin'), deleteCategoryHandler);

export default router;
