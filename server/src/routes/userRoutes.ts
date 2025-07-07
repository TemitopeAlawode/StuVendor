// EXTERNAL IMPORTS
import express from 'express';  // Importing express

// INTERNAL IMPORTS
import passport from '../middleware/passport'; // Importing passport file for Google Authentication
// import config from '../config/config';  // Importing config file to access jwt secret key
const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
    createUserHandler,
    googleAuthCallbackHandler,
    googleAuthFrontendHandler,
    loginUserHandler,
    getUsersHandler,
    getUserByIdHandler,
    completeProfileHandler,
    updateUserHandler,
    logoutUserHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
    verifyEmailHandler,
    getUserOrdersHandler
} from '../controllers/userController';

// Importing Middleware for authentication/validation of tokens and check user role
import validateToken from '../middleware/verifyToken';
// import checkIfAdmin from '../middleware/checkIfAdmin';
import checkUserRole from '../middleware/checkUserRole';

// Initialize router
const router = express.Router();

// Get orders
router.get('/users/orders', validateToken,  getUserOrdersHandler);

// Manual Signup and Signin
router.post('/signup', createUserHandler);
router.post('/signin', loginUserHandler);

// Admin: Get all Users
// router.get('/users', validateToken, checkIfAdmin, getUsersHandler);
router.get('/users', validateToken, checkUserRole('admin'), getUsersHandler);

// Get Users by id
router.get('/users/:id', validateToken, getUserByIdHandler)


// ============== GOOGLE OAUTH ============== //
// Step 1: Redirect to Google
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google Callback
router.get('/google/callback', passport.authenticate("google", { 
    // successRedirect: 'http://localhost:5173/auth/login',
     failureRedirect: "/auth/signup" }),
    googleAuthCallbackHandler
);

// Handle Google OAuth from frontend (@react-oauth/google)
router.post("/google", googleAuthFrontendHandler);

// Complete Profile (For Google Users)
router.put('/complete-profile', validateToken, completeProfileHandler);

// Update/Edit User Profile
router.put('/update-profile', validateToken, updateUserHandler);

// Logout User Route
router.post('/logout', validateToken, logoutUserHandler);

// Forgot Password Route
router.post('/forgot-password', forgotPasswordHandler);

// Reset Password Route
router.post('/reset-password', resetPasswordHandler);

// Verify Email Route
router.get("/verify-email", verifyEmailHandler);


export default router;