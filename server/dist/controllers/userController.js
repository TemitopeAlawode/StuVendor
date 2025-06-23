"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.forgotPasswordHandler = exports.logoutUserHandler = exports.updateUserHandler = exports.completeProfileHandler = exports.getUsersHandler = exports.loginUserHandler = exports.googleAuthFrontendHandler = exports.googleAuthCallbackHandler = exports.verifyEmailHandler = exports.createUserHandler = void 0;
// Importing bcrypt for hashing password
const bcrypt_1 = __importDefault(require("bcrypt"));
// Importing User model
const User_1 = __importDefault(require("../models/User"));
// Importing config file to access jwt secret key
// import config from '../config/config';
const config = require('../config/config');
// Importing jwt
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// importing sendEmail function
const email_1 = require("../utils/email");
// Importing dotenv to load env variables
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const PasswordReset_1 = __importDefault(require("../models/PasswordReset"));
const axios_1 = __importDefault(require("axios"));
// Loads .env file contents into process.env
dotenv_1.default.config();
// ================================================
// @desc   Create/Register a new User
// @route  POST  /auth/signup
// @access Public
// ================================================
const createUserHandler = async (req, res) => {
    try {
        let { name, email, password, userType, studentStatus } = req.body;
        // let { name, email, password, userType, studentStatus } = req.body;
        // Checking for missing fields
        if (!name ||
            !email ||
            !password ||
            !userType
        // || studentStatus === undefined
        ) {
            res.status(400).json({
                message: "Please enter all fields",
            });
            return; // This stops the function from going further
        }
        // Validate datatypes
        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string") {
            res.status(400).json({
                message: "Name, email and password must be strings"
            });
            return; // This stops the function from going further
        }
        // Checking for password length
        if (password.length < 8) {
            res.status(400).json({
                message: "Password must be at least 8 characters"
            });
            return; // This stops the function from going further
        }
        // Check if the user already exist using email
        const existingUser = await User_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({
                message: 'Email already exists..'
            });
            return; // This stops the function from going further
        }
        // Set profile to completed(true) by default for normal signup
        const profileCompleted = true;
        // Hashing the Password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Creating the user in the database
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
            userType,
            studentStatus,
            profileCompleted,
            verified: false // User is not verified yet
        });
        // Generate a verification token
        const verificationToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "1d" } // Token expires in 1 day
        );
        // Create verification URL
        const verificationUrl = `${process.env.VITE_FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
        // Send welcome email after successful registration
        // Using try..catch for proper error handling
        try {
            // await sendEmail({
            (0, email_1.sendEmail)({
                to: email,
                subject: "Welcome to StuVendor - Verify Your Email",
                text: `Hello ${name},\n\nThank you for registering with StuVendor! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe StuVendor Team`,
                // subject: 'Hello, welcome to StuVendor!',
                // text: `Hello ${name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
            });
            console.log('Welcome email sent successfully to: ', email);
        }
        catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Optionally, I can delete the user if email sending fails
            await user.destroy();
            res.status(500).json({ message: "Failed to send verification email. Please try again." });
            return;
        }
        res.status(201).json({ message: "User created successfully. Please check your email to verify your account.", user });
    }
    catch (error) {
        console.error(error);
        // log(error)
        res.status(500).json({ message: "Error creating user" });
    }
};
exports.createUserHandler = createUserHandler;
// ================================================
// @desc   Verify user's email
// @route  GET  /auth/verify-email
// @access Public
// ================================================
const verifyEmailHandler = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            res.status(400).json({ message: "Invalid verification token" });
            return;
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, config.jwtSecret);
        const user = await User_1.default.findOne({ where: { id: decoded.id, email: decoded.email } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.verified) {
            res.status(200).json({ message: "Email already verified" });
            return;
        }
        // Mark the user as verified
        await user.update({ verified: true });
        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ message: "Verification link has expired" });
        }
        else if (error.name === "JsonWebTokenError") {
            res.status(400).json({ message: "Invalid verification token" });
        }
        else {
            res.status(500).json({ message: "Error verifying email" });
        }
    }
};
exports.verifyEmailHandler = verifyEmailHandler;
// ================================================
// This is for Google Users
// @desc    Handle Google OAuth2 Callback
// @route   GET /auth/google/callback
// @access  Public (triggered after successful Google auth)
// ================================================
const googleAuthCallbackHandler = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Calling/Using the interface
        // const user = (req.user as CustomUser);
        const user = req.user;
        const payload = { id: user.id };
        // Check if the user already exist using email
        //  const existingUser = await User.findOne({ where: { user } });
        //  if (existingUser) {
        //    res.status(409).json({
        //      message: 'Email already exists..'
        //    });
        //    return; // This stops the function from going further
        //  }
        // Generate token for authenticated Google user
        const token = jsonwebtoken_1.default.sign(payload, config.jwtSecret, { expiresIn: '7d' });
        res.json({
            token,
            user: req.user
        });
        // Send welcome email after successful registration
        (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Hello, welcome to StuVendor!',
            text: `Hello ${user.name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
        });
    }
    catch (error) {
        console.error('Google Auth Callback Error', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
exports.googleAuthCallbackHandler = googleAuthCallbackHandler;
// ================================================
// @desc    Handle Google OAuth2 for signup and login from Frontend (used by @react-oauth/google)
// @route   POST /auth/google
// @access  Public
// ================================================
// export const googleAuthFrontendHandler = async (req: Request, res: Response) => {
//   const { access_token } = req.body;
//   if (!access_token) {
//      res.status(400).json({ message: "Access token is required" });
//      return;
//   }
//   try {
//     // Verify the access token with Google's API
//     const response = await axios.get(
//       `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
//     );
//     const profile = response.data;
//     // Find or create user
//     let user = await User.findOne({ where: { googleId: profile.sub } });
//     if (!user) {
//       // Check if user exists with this email
//       const existingUser = await User.findOne({ where: { email: profile.email } });
//       if (existingUser) {
//          res.status(409).json({ message: "Email already exists. Please log in." });
//          return;
//       }
//       // Create new user
//       user = await User.create({
//         googleId: profile.sub,
//         email: profile.email,
//         name: profile.name,
//         userType: "customer",
//         profileCompleted: false
//       });
//       // Send welcome email
//       await sendEmail({
//         to: user.email,
//         subject: "Hello, welcome to StuVendor!",
//         text: `Hello ${user.name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
//       });
//     }
//     // Generate JWT token
//     const payload = { id: user.id };
//     const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: "7d" });
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     console.error("Google Auth Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const googleAuthFrontendHandler = async (req, res) => {
    const { access_token, action } = req.body; // Add action parameter to distinguish signup vs login
    if (!access_token) {
        res.status(400).json({ message: "Access token is required" });
        return;
    }
    if (!action || !["signup", "login"].includes(action)) {
        res.status(400).json({ message: "Invalid action. Must be 'signup' or 'login'." });
        return;
    }
    try {
        // Verify the access token with Google's API
        const response = await axios_1.default.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        const profile = response.data;
        // Find user by googleId
        let user = await User_1.default.findOne({ where: { googleId: profile.sub } });
        // If user doesn't exist, check by email (in case they signed up manually but are logging in with Google)
        if (!user) {
            user = await User_1.default.findOne({ where: { email: profile.email } });
            if (user && action === "login") {
                // Update the user's googleId if they signed up manually but are now using Google login
                await user.update({ googleId: profile.sub });
            }
        }
        // Handle based on action
        if (action === "signup") {
            if (user) {
                // User already exists (either by googleId or email)
                res.status(409).json({ message: "Email already exists. Please log in." });
                return;
            }
            // Create new user
            user = await User_1.default.create({
                googleId: profile.sub,
                email: profile.email,
                name: profile.name,
                userType: "customer",
                profileCompleted: false,
                verified: false // New field to track verification status
            });
            // Send welcome email
            // await sendEmail({
            (0, email_1.sendEmail)({
                to: user.email,
                subject: "Hello, welcome to StuVendor!",
                text: `Hello ${user.name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
            });
        }
        else if (action === "login") {
            if (!user) {
                // User doesn't exist, return error for login
                res.status(404).json({ message: "User not found. Please sign up first." });
                return;
            }
        }
        // Generate JWT token
        const payload = { id: user?.id };
        const token = jsonwebtoken_1.default.sign(payload, config.jwtSecret, { expiresIn: "7d" });
        res.json({
            success: true,
            token,
            user: {
                id: user?.id,
                email: user?.email,
                name: user?.name,
                userType: user?.userType,
                profileCompleted: user?.profileCompleted,
            },
        });
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.googleAuthFrontendHandler = googleAuthFrontendHandler;
// ================================================
// @desc    Login existing User
// @route   POST /auth/signin
// @access  Public
// ================================================
const loginUserHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Ensure all fields are present
        if (!email || !password) {
            res.status(400).json({
                message: 'Please enter email and password'
            });
            return; // This stops the function from going further
        }
        // Find User by email
        const user = await User_1.default.findOne({ where: { email } });
        // Allow only normal users to log in and Block Google users from 
        // logging in here (because they don't have a password).
        if (!user || user.googleId) {
            res.status(401).json({
                message: 'Invalid email or password'
            });
            return; // This stops the function from going further
        }
        // Check if password is valid
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: 'Invalid password'
            });
            return; // This stops the function from going further
        }
        // Generate/Create JWT (token)
        const payload = { id: user.id, email: user.email, userType: user.userType };
        const token = jsonwebtoken_1.default.sign(payload, config.jwtSecret, { expiresIn: '7d' });
        // console.log('user-payload type:', payload.userType);
        res.status(200).json({
            message: 'Login/Signin successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                profileCompleted: user.profileCompleted,
                // verified: user.verified, 
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing in user" });
    }
};
exports.loginUserHandler = loginUserHandler;
// ================================================
// @desc   View all Users (only admins)
// @route  GET /auth/users
// @access Private (only admins)
// ================================================
const getUsersHandler = async (req, res) => {
    try {
        const users = await User_1.default.findAll();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
exports.getUsersHandler = getUsersHandler;
// ================================================
// @desc   Complete Profile(For Google Users)
// @route  PUT /auth/complete-profile
// @access Private
// ================================================
const completeProfileHandler = async (req, res) => {
    try {
        let { userType } = req.body;
        // let { userType, studentStatus } = req.body;
        // Ensure all fields are provided
        // if (!userType || studentStatus === undefined) {
        if (!userType) {
            res.status(400).json({
                message: 'Please fill in all fields'
            });
            return; // This stops the function from going further
        }
        // Get user ID from the token (assuming token validation middleware is in place)
        // This comes from the validated token as req.user should be set by verifyToken middleware
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Calling/Using the interface
        const id = req.user.id;
        // Updating the table in the database
        // const user = await User.update({ userType, studentStatus },
        //   { where: { id } }
        // );
        // Fetch user details to be updated from the database
        const user = await User_1.default.findByPk(id);
        if (!user) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }
        // Update the user details in the database
        user.userType = userType;
        // user.studentStatus = studentStatus;
        user.profileCompleted = true;
        // Save changes to the database
        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully', user
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user profile" });
    }
};
exports.completeProfileHandler = completeProfileHandler;
// export const completeProfileHandler = async (req: Request, res: Response) => {
//   try {
//     const { userType, studentStatus } = req.body;
//     // Log the incoming request body for debugging
//     console.log("Request body:", { userType, studentStatus });
//     // Ensure all fields are provided
//     if (!userType || studentStatus === undefined) {
//       console.log("Validation failed: Missing fields");
//        res.status(400).json({ message: "Please fill in all fields" });
//     return;
//       }
//     // Validate userType
//     const validUserTypes = ["customer", "vendor", "admin"];
//     if (!validUserTypes.includes(userType)) {
//       console.log("Validation failed: Invalid userType:", userType);
//        res.status(400).json({ message: "Invalid user type. Must be 'customer', 'vendor', or 'admin'." });
//     return;
//       }
//     // Validate studentStatus
//     // if (typeof studentStatus !== "boolean") {
//     //   console.log("Validation failed: Invalid studentStatus:", studentStatus);
//     //    res.status(400).json({ message: "Student status must be a boolean (true/false)." });
//     // return;
//     //   }
//     // Ensure user is authenticated
//     console.log("Checking req.user:", req.user);
//     if (!req.user) {
//       console.log("Authentication failed: No user in request");
//        res.status(401).json({ message: "User not authenticated" });
//     return;
//       }
//     const id = (req.user as CustomUser).id;
//     console.log("Authenticated user ID:", id);
//     // Fetch user from the database
//     const user = await User.findByPk(id);
//     if (!user) {
//       console.log("User not found for ID:", id);
//        res.status(404).json({ message: "User not found" });
//     return;
//       }
//     console.log("User found:", user.toJSON());
//     // Update user details
//     user.userType = userType;
//     user.studentStatus = studentStatus;
//     user.profileCompleted = true;
//     // Save changes to the database
//     console.log("Saving user updates...");
//     await user.save();
//     console.log("User updated successfully:", user.toJSON());
//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         userType: user.userType,
//         studentStatus: user.studentStatus,
//         profileCompleted: user.profileCompleted,
//       },
//     });
//   } catch (error: any) {
//     console.error("Error updating user profile:", {
//       message: error.message,
//       stack: error.stack,
//       details: error,
//     });
//     res.status(500).json({ message: "Error updating user profile", error: error.message });
//   }
// };
// ================================================
// @desc   Update/Edit User Profile
// @route  PUT  /auth/update-profile
// @access Private (Verified Users Only)
// ================================================
const updateUserHandler = async (req, res) => {
    try {
        const { name, email, password, userType, studentStatus } = req.body;
        // When a user logs in or sends a token, middleware verifies it and attaches the
        //  decoded user object to req.user.  req.user is being casted to the CustomUser type to
        //  get the id, which will be used to find the matching vendor profile.
        // Calling the interface for typechecking
        // const user = req.user as CustomUser;
        // const user = await User.findOne({ where: { id: user.id } });
        const user = await User_1.default.findByPk(req.user.id);
        // const user = await User.findOne({ where: { id: (req.user as CustomUser).id } });
        if (!user) {
            res.status(404).json({ message: 'User profile not found' });
            return; // Stops the function from going any further
        }
        // Update the details in the database
        await user.update({
            name: name || user.name,
            email: email || user.email,
            password: password || user.password,
            userType: userType || user.userType,
            studentStatus: studentStatus || user.studentStatus
        });
        res.status(200).json({ message: 'User profile updated successfully!', user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user profile..' });
    }
};
exports.updateUserHandler = updateUserHandler;
// ================================================
// @desc   Logout User
// @route  POST  /auth/logout
// @access Private
// ================================================
const logoutUserHandler = async (req, res) => {
    try {
        // The token is verified by verifyToken middleware, so we know the user is authenticated
        // No server-side invalidation is needed for stateless JWT (client clears the token)
        // Respond with a success message
        res.status(400).json({ message: 'User successfully logged out..' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging out' });
    }
};
exports.logoutUserHandler = logoutUserHandler;
// ================================================
// @desc Forgot Password
// @route POST /auth/forgot-password
// @access Public
// ================================================
const forgotPasswordHandler = async (req, res) => {
    try {
        // Accept email 
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        // Check if the email exist
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate a reset token
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
        // Save token to PasswordReset table
        await PasswordReset_1.default.create({
            UserId: user.id,
            token,
            expiresAt: expiresAt
        });
        // Send reset 
        // const resetLink = `http://your-frontend-url/auth/reset-password?token=${token}`;
        // const resetLink = `http://localhost:5173/auth/reset-password?token=${token}`;
        const resetLink = `${process.env.VITE_FRONTEND_URL}/auth/reset-password?token=${token}`;
        // Send email for password reset
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Password Reset Request', // Subject line
            text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe StuVendor Team`,
        });
        res.status(200).json({ message: 'Password reset email sent' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing forgot password request' });
    }
};
exports.forgotPasswordHandler = forgotPasswordHandler;
// ================================================
// @desc Reset Password
// @route POST /auth/reset-password
// @access Public
// ================================================
const resetPasswordHandler = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters' });
            return;
        }
        // Find the reset token
        const resetRecord = await PasswordReset_1.default.findOne({ where: { token } });
        if (!resetRecord) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Check if token has expired
        if (resetRecord.expiresAt < new Date()) {
            await resetRecord.destroy();
            res.status(400).json({ message: 'Token has expired' });
            return;
        }
        // Find the user
        const user = await User_1.default.findByPk(resetRecord.UserId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Hash the new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update user's password
        await user.update({ password: hashedPassword });
        // Delete the reset token
        await resetRecord.destroy();
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
exports.resetPasswordHandler = resetPasswordHandler;
// ================================================
// @desc   Create/Register a new User
// @route  POST  /auth/signup
// @access Public
// ================================================
// export const createUserHandler = async (req: Request, res: Response) => {
//   try {
//     let { name, email, password, userType, studentStatus }: CustomUser = req.body;
//     // let { name, email, password, userType, studentStatus } = req.body;
//     // Checking for missing fields
//     if (
//       !name ||
//       !email ||
//       !password ||
//       !userType 
//       // || studentStatus === undefined
//     ) {
//       res.status(400).json({
//         message: "Please enter all fields",
//       });
//       return; // This stops the function from going further
//     }
//     // Validate datatypes
//     if (
//       typeof name !== "string" ||
//       typeof email !== "string" ||
//       typeof password !== "string"
//     ) {
//       res.status(400).json({
//         message: "Name, email and password must be strings"
//       });
//       return; // This stops the function from going further
//     }
//     // if (typeof studentStatus !== "boolean") {
//     //   res.status(400).json({
//     //     message: "Student status must be boolean"
//     //   });
//     //   return;
//     // }
//     // else{
//     //   res.status(404).json({ message: 'Invalid value for studentStatus. Must be true or false' })
//     // }
//     // Checking for password length
//     if (password.length < 8) {
//       res.status(400).json({
//         message: "Password must be at least 8 characters"
//       });
//       return; // This stops the function from going further
//     }
//     // Check if the user already exist using email
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       res.status(409).json({
//         message: 'Email already exists..'
//       });
//       return; // This stops the function from going further
//     }
//     // Set profile to completed(true) by default for normal signup
//     const profileCompleted = true;
//     // Hashing the Password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Creating the user in the database
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       userType,
//       studentStatus,
//       profileCompleted,
//       verified: false 
//     });
//     // Generate/Create JWT (token) 
//     // const payload = { id: user.id, email: user.email };
//     // const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
//     // Send welcome email after successful registration
//     // Using try..catch for proper error handling
//     try {
//     // await sendEmail({
//       sendEmail({
//       to: email,
//       subject: 'Hello, welcome to StuVendor!',
//       text: `Hello ${name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
//     });
//     console.log('Welcome email sent successfully to: ', email);
//     } catch (emailError) {
//       console.error('Failed to send welcome email: ', emailError);
//     }
//     res.status(201).json({ message: "User created successfully", user });
//   } catch (error) {
//     console.error(error);
//     // log(error)
//     res.status(500).json({ message: "Error creating user" });
//   }
// };
