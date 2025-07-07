// Importing bcrypt for hashing password
import bcrypt from 'bcrypt';
// Importing User model
import User from '../models/User';
// Importing config file to access jwt secret key
// import config from '../config/config';
const config = require('../config/config');
// Importing jwt
import jwt from 'jsonwebtoken';
// Importing req and res from express
import { Request, Response } from 'express';
// importing sendEmail function
import { sendEmail } from '../utils/email';

// Importing dotenv to load env variables
import dotenv from 'dotenv';

import { v4 as UUIDV4 } from 'uuid';
import PasswordReset from '../models/PasswordReset';
import axios from 'axios';
import OrderProducts from '../models/OrderProducts';
import Order from '../models/Order';
// Loads .env file contents into process.env
dotenv.config();


// Defining interface for type checking
interface CustomUser {
  id: string
  name: string
  email: string
  password?: string // optional
  // userType?: string
  userType?: 'customer' | 'vendor' | 'admin';
  studentStatus?: boolean
  googleId?: string
  profileCompleted: boolean
  verified: boolean; // New field to track verification status
    UserId: string
}



// ================================================
// @desc   Create/Register a new User
// @route  POST  /auth/signup
// @access Public
// ================================================
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    let { name, email, password, userType, studentStatus }: CustomUser = req.body;
    // let { name, email, password, userType, studentStatus } = req.body;
    // Checking for missing fields
    if (
      !name ||
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
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        message: 'Email already exists..'
      });
      return; // This stops the function from going further
    }

    // Set profile to completed(true) by default for normal signup
    const profileCompleted = true;

    // Hashing the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating the user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
      studentStatus,
      profileCompleted,
      verified: false  // User is not verified yet

    });

   // Generate a verification token
        const verificationToken = jwt.sign(
            { id: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: "1d" } // Token expires in 1 day
        );

        // Create verification URL
        const verificationUrl = `${process.env.VITE_FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    // Send welcome email after successful registration
    // Using try..catch for proper error handling
    try {
    // await sendEmail({
      sendEmail({
      to: email,
      subject: "Welcome to StuVendor - Verify Your Email",
      text: `Hello ${name},\n\nThank you for registering with StuVendor! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe StuVendor Team`,
      // subject: 'Hello, welcome to StuVendor!',
      // text: `Hello ${name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
    });
    console.log('Welcome email sent successfully to: ', email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Optionally, I can delete the user if email sending fails
      await user.destroy();
      res.status(500).json({ message: "Failed to send verification email. Please try again." });
      return;
    }

    res.status(201).json({ message: "User created successfully. Please check your email to verify your account.", user });
  } catch (error) {
    console.error(error);
    // log(error)
    res.status(500).json({ message: "Error creating user" });
  }
};


// ================================================
// @desc   Verify user's email
// @route  GET  /auth/verify-email
// @access Public
// ================================================
export const verifyEmailHandler = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            res.status(400).json({ message: "Invalid verification token" });
            return;
        }

        // Verify the token
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
        const user = await User.findOne({ where: { id: decoded.id, email: decoded.email } });

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
    } catch (error: any) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ message: "Verification link has expired" });
        } else if (error.name === "JsonWebTokenError") {
            res.status(400).json({ message: "Invalid verification token" });
        } else {
            res.status(500).json({ message: "Error verifying email" });
        }
    }
};


// ================================================
// This is for Google Users
// @desc    Handle Google OAuth2 Callback
// @route   GET /auth/google/callback
// @access  Public (triggered after successful Google auth)
// ================================================
export const googleAuthCallbackHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
   
    // Calling/Using the interface
    // const user = (req.user as CustomUser);
    const user = req.user as  InstanceType<typeof User>;
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
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: '7d' });
    res.json({
      token,
      user: req.user
    })
    // Send welcome email after successful registration
     sendEmail({
      to: user.email,
      subject: 'Hello, welcome to StuVendor!',
      text: `Hello ${user.name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
    });
    
  } catch (error) {
    console.error('Google Auth Callback Error', error);
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

// ================================================
// @desc    Handle Google OAuth2 for signup and login from Frontend (used by @react-oauth/google)
// @route   POST /auth/google
// @access  Public
// ================================================
export const googleAuthFrontendHandler = async (req: Request, res: Response) => {
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
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );
    const profile = response.data;

    // Find user by googleId
    let user = await User.findOne({ where: { googleId: profile.sub } });

    // If user doesn't exist, check by email (in case they signed up manually but are logging in with Google)
    if (!user) {
      user = await User.findOne({ where: { email: profile.email } });
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
      user = await User.create({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        userType: "customer",
        profileCompleted: false,
        verified: false // New field to track verification status

      });

      // Send welcome email
      // await sendEmail({
       sendEmail({
        to: user.email,
        subject: "Hello, welcome to StuVendor!",
        text: `Hello ${user.name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
      });
    } else if (action === "login") {
      if (!user) {
        // User doesn't exist, return error for login
         res.status(404).json({ message: "User not found. Please sign up first." });
         return;
        }
    }

    // Generate JWT token
    const payload = { id: user?.id };
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: "7d" });

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
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ================================================
// @desc    Login existing User
// @route   POST /auth/signin
// @access  Public
// ================================================
export const loginUserHandler = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ where: { email } });

    // Allow only normal users to log in and Block Google users from 
    // logging in here (because they don't have a password).
    if (!user || user.googleId) {
      res.status(401).json({
        message: 'Invalid email or password'
      });
      return; // This stops the function from going further
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid password'
      });
      return; // This stops the function from going further
    }

    // Check if user is verified
    if (!user.verified) {
       res.status(403).json({ message: 'Please verify your email before logging in.' });
       return;
    }

    // Generate/Create JWT (token)
    const payload = { id: user.id, email: user.email, userType: user.userType };
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: '7d' });
    // console.log('user-payload type:', payload.userType);
    res.status(200).json({
      message: 'Login/Signin successful', 
      token,
      user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                profileCompleted: user.profileCompleted,
                verified: user.verified, 
            },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error signing in user" });
  }
}



// ================================================
// @desc   View all Users (only admins)
// @route  GET /auth/users
// @access Private (only admins)
// ================================================
export const getUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message
    })
  }
}



// ================================================
// @desc   View/Get User by ID
// @route  GET /auth/users/:id
// @access Private (only logged in users)
// ================================================
export const getUserByIdHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return; // Stops the function from going any further
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user by ID', error });
    }
}



// ================================================
// @desc   Complete Profile(For Google Users)
// @route  PUT /auth/complete-profile
// @access Private
// ================================================
export const completeProfileHandler = async (req: Request, res: Response) => {
  try {
    let { userType } = req.body;
    // let { userType, studentStatus } = req.body;

    // Ensure all fields are provided
    // if (!userType || studentStatus === undefined) {
    if (!userType) {
      res.status(400).json({
        message: 'Please fill in all fields'
      });
      return;  // This stops the function from going further
    }

    // Get user ID from the token (assuming token validation middleware is in place)
    // This comes from the validated token as req.user should be set by verifyToken middleware
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Calling/Using the interface
    const id = (req.user as CustomUser).id;

    // Updating the table in the database
    // const user = await User.update({ userType, studentStatus },
    //   { where: { id } }
    // );

    // Fetch user details to be updated from the database
    const user = await User.findByPk(id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user profile" });
  }
}



// ================================================
// @desc   Update/Edit User Profile
// @route  PUT  /auth/update-profile
// @access Private (Verified Users Only)
// ================================================
export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password, userType, studentStatus }: CustomUser = req.body;

    // When a user logs in or sends a token, middleware verifies it and attaches the
    //  decoded user object to req.user.  req.user is being casted to the CustomUser type to
    //  get the id, which will be used to find the matching vendor profile.

    // Calling the interface for typechecking
    // const user = req.user as CustomUser;
    // const user = await User.findOne({ where: { id: user.id } });

    const userInfo = req.user as CustomUser
    const userId = userInfo.UserId || userInfo.id

    // const user = await User.findByPk((req.user as CustomUser).id);
    const user = await User.findByPk(userId);
    console.log('Id: ', (req.user as CustomUser).id);
    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user profile..' });
  }
}


// ================================================
// @desc   Logout User
// @route  POST  /auth/logout
// @access Private
// ================================================
export const logoutUserHandler = async (req: Request, res: Response) => {
  try {
    // The token is verified by verifyToken middleware, so we know the user is authenticated
    // No server-side invalidation is needed for stateless JWT (client clears the token)

    // Respond with a success message
    res.status(400).json({ message: 'User successfully logged out..' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging out' });
  }
}


// ================================================
// @desc Forgot Password
// @route POST /auth/forgot-password
// @access Public
// ================================================
export const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    // Accept email 
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }
    // Check if the email exist
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate a reset token
    const token = UUIDV4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save token to PasswordReset table
    await PasswordReset.create({
      UserId: user.id as string,
      token,
      expiresAt: expiresAt
    });

    // Send reset 
    
    // const resetLink = `http://your-frontend-url/auth/reset-password?token=${token}`;
    // const resetLink = `http://localhost:5173/auth/reset-password?token=${token}`;
    const resetLink = `${process.env.VITE_FRONTEND_URL}/auth/reset-password?token=${token}`;

    // Send email for password reset
    await sendEmail({
      to: email,
      subject: 'Password Reset Request', // Subject line
      text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe StuVendor Team`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
}


// ================================================
// @desc Reset Password
// @route POST /auth/reset-password
// @access Public
// ================================================
export const resetPasswordHandler = async (req: Request, res: Response) => {
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
    const resetRecord = await PasswordReset.findOne({ where: { token } });
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
    const user = await User.findByPk(resetRecord.UserId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await user.update({ password: hashedPassword });

    // Delete the reset token
    await resetRecord.destroy();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}



// ================================================
// @desc   View/Get customers orders
// @route  GET auth/users/orders
// @access Private
// ================================================
/*
Step 1: Fetch the user id.
Step 2: Query OrderProducts where UserId matches the user’s ID to get all products ordered by this user.
Step 3: Extract unique OrderIds from the OrderProducts results.
Step 4: Fetch Order records for those OrderIds.
Step 5: Combine the data to create a response where each order includes its associated products from OrderProducts.
Output: The response is a list of orders with their details (e.g., totalAmount, orderStatus) and the vendor’s products within each order (e.g., ProductId, quantity, price).
*/
export const getUserOrdersHandler = async (req: Request, res: Response) => {
    try {
        // Fetch user ID
        const user = req.user as CustomUser;
        const userId = user.UserId || user.id;
        
        
        console.log('User Id: ', userId);
        
        // Fetch OrderProducts entries for this user
        const orderProducts = await OrderProducts.findAll({
            where: { UserId: userId },
            attributes: ['OrderId', 'ProductId', 'quantity', 'price'], // Relevant fields
        });

        if (!orderProducts.length) {
            res.status(200).json([]);
            // res.status(200).json({ message: 'No orders found for this vendor.' });
            return;
        }

        // Get unique OrderIds from OrderProducts
        /*
        map()  | Pulls all `OrderId`s from the array orderProducts     
        Set()  | Removes duplicates and only keeps unique values    
        [... ] | Turns Set back into array 
        */
        const orderIds = [...new Set(orderProducts.map((ord) => ord.OrderId))];

        // Fetch Order details/records for these OrderIds
        const orders = await Order.findAll({
            where: { id: orderIds },
        });

        // Combine OrderProducts with Orders for response
        /*
        Loops through all orders.
        For each order, finds its matching products.
        ...order.toJSON() - This spreads all the original order data into a plain object
        Combines them into a new object with the order info and its products.
        Useful when returning vendor orders with their product details in one response.
        */
        const userOrders = orders.map((order) => ({
            ...order.toJSON(),
            Products: orderProducts
                .filter((op) => op.OrderId === order.id)
                .map((op) => ({
                    ProductId: op.ProductId,
                    quantity: op.quantity,
                    price: op.price,
                })),
        }));


        console.log('User Orders: ', userOrders)

        res.status(200).json(userOrders);
        // res.status(200).json(userId);

    } catch (error: any) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
}

































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