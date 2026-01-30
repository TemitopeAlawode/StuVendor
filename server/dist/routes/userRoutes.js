"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXTERNAL IMPORTS
const express_1 = __importDefault(require("express")); // Importing express
// INTERNAL IMPORTS
const passport_1 = __importDefault(require("../middleware/passport")); // Importing passport file for Google Authentication
// import config from '../config/config';  // Importing config file to access jwt secret key
const config = require('../config/config');
// Importing APIs handlers (Controllers)
const userController_1 = require("../controllers/userController");
// Importing Middleware for authentication/validation of tokens and check user role
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
// import checkIfAdmin from '../middleware/checkIfAdmin';
const checkUserRole_1 = __importDefault(require("../middleware/checkUserRole"));
// Initialize router
const router = express_1.default.Router();
// Get orders
router.get('/users/orders', verifyToken_1.default, userController_1.getUserOrdersHandler);
// Manual Signup and Signin
router.post('/signup', userController_1.createUserHandler);
router.post('/signin', userController_1.loginUserHandler);
// Admin: Get all Users
// router.get('/users', validateToken, checkIfAdmin, getUsersHandler);
router.get('/users', verifyToken_1.default, (0, checkUserRole_1.default)('admin'), userController_1.getUsersHandler);
// Get Users by id
router.get('/users/:id', verifyToken_1.default, userController_1.getUserByIdHandler);
// ============== GOOGLE OAUTH ============== //
// Step 1: Redirect to Google
router.get('/google', passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Step 2: Google Callback
router.get('/google/callback', passport_1.default.authenticate("google", {
    // successRedirect: 'http://localhost:5173/auth/login',
    failureRedirect: "/auth/signup"
}), userController_1.googleAuthCallbackHandler);
// Handle Google OAuth from frontend (@react-oauth/google)
router.post("/google", userController_1.googleAuthFrontendHandler);
// Complete Profile (For Google Users)
router.put('/complete-profile', verifyToken_1.default, userController_1.completeProfileHandler);
// Update/Edit User Profile
router.put('/update-profile', verifyToken_1.default, userController_1.updateUserHandler);
// Logout User Route
router.post('/logout', verifyToken_1.default, userController_1.logoutUserHandler);
// Forgot Password Route
router.post('/forgot-password', userController_1.forgotPasswordHandler);
// Reset Password Route
router.post('/reset-password', userController_1.resetPasswordHandler);
// Verify Email Route
router.get("/verify-email", userController_1.verifyEmailHandler);
exports.default = router;
