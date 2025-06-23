import jwt from "jsonwebtoken";
// Importing User and Vendor model
import User from "../models/User";
import Vendor from "../models/Vendor";
// Importing config file to access jwt secret key
// import config from '../config/config';
const config = require("../config/config");
// Importing req, res and next from express -
// Request, Response, and NextFunction from Express for type definitions
import { Request, Response, NextFunction } from "express";

// Interface for decoded JWT payload to ensure type safety
interface DecodedJWToken {
  id: string; // User ID from the JWT
  userType?: "customer" | "vendor" | "admin";
}

/**
 * Middleware to validate JWT and authenticate users or vendors.
 * Attaches the authenticated User or Vendor instance to req.user.
 * * For /create-vendor-profile, allows users with userType 'vendor' without a Vendor record.
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction to pass control to the next middleware
 */
const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if there's anything in the auth header
    // Check if Authorization header is present
    if (!req.headers.authorization) {
      res.status(401).json({
        message: "Authorization header is required",
      });
      return; // Stop execution if header is missing
    }

    // Extract token from 'Bearer <token>' format
    const token = req.headers.authorization.split(" ")[1]; // to remove the 'Bearer' keyword and display only the token

    if (!token) {
      res.status(401).json({
        message: "Access denied. No token provided",
      });
      return; // Stop execution if token is missing
    }

    // Verify Token
    // Verify and decode JWT using the secret key
    const decodedToken = jwt.verify(
      token,
      config.jwtSecret as string
    ) as DecodedJWToken;
    console.log("Decoded token:", decodedToken);

    // Check if token is invalid or expired
    if (!decodedToken) {
      res.status(401).json({
        message: "Invalid Token",
      });
      return; // Stop execution if token verification fails
    }

    // Verify user exists in Users table
    // Verify from the database that a User with the id exist
    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      res.status(401).json({
        message: "Error fetching user",
      });
      return; // Stop execution if user is not found
    }

    // Handle vendor users
    if (decodedToken.userType === "vendor") {
      // and the person is trying to do anything that has to do with product
      // For /create-vendor-profile, allow user without Vendor record
      if (req.path === "/create-vendor-profile") {
        req.user = user; // Attach User instance to req.user
      } else {
        // Query Vendors table to find vendor by UserId (linked to Users.id)
        const vendor = await Vendor.findOne({
          where: { UserId: decodedToken.id },
        });
        if (!vendor) {
          res.status(401).json({
            message:
              "Error fetching vendor...Vendor profile not found. Please complete vendor registration.",
          });
          return; // Stop execution if vendor is not found
        }
        req.user = vendor; // Attach Vendor instance to req.user
        // req.user = {
        //   id: user.id,
        //   userType: decodedToken.userType,
        //   UserId: vendor.UserId,
        // };
      }
    } else {
      // Handle non-vendor users (customer or admin)
      // whatever API this middleware is put on, inside that API you'll have access to the full user object or details
      //  the logged in user info is stored here...
      req.user = user; // Attach User instance to req.user

    // Attach user and userType to req.user for consistency
    // req.user = {
    //   id: user.id,
    //   userType: decodedToken.userType,
    // };
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
  }
};

export default validateToken;

// import jwt from 'jsonwebtoken';
// // Importing User and Vendor model
// import User from '../models/User';
// import Vendor from '../models/Vendor';
// // Importing config file to access jwt secret key
// // import config from '../config/config';
// const config = require('../config/config');
// // Importing req, res and next from express -
// // Request, Response, and NextFunction from Express for type definitions
// import { Request, Response, NextFunction } from "express";

// // Interface for decoded JWT payload to ensure type safety
// interface DecodedJWToken {
//     id: string; // User ID from the JWT
//     userType?: 'customer' | 'vendor' | 'admin';
// }

// /**
//  * Middleware to validate JWT and authenticate users or vendors.
//  * Attaches the authenticated User or Vendor instance to req.user.
//  * * For /create-vendor-profile, allows users with userType 'vendor' without a Vendor record.
//  * @param req - Express Request object
//  * @param res - Express Response object
//  * @param next - Express NextFunction to pass control to the next middleware
//  */
// const validateToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Check if there's anything in the auth header
//         // Check if Authorization header is present
//         if (!req.headers.authorization) {
//             res.status(401).json({
//                 message: 'Authorization header is required'
//             });
//             return; // Stop execution if header is missing
//         }

//         // Extract token from 'Bearer <token>' format
//         const token = req.headers.authorization.split(' ')[1]; // to remove the 'Bearer' keyword and display only the token

//         if (!token) {
//             res.status(401).json({
//                 message: 'Access denied. No token provided'
//             });
//             return; // Stop execution if token is missing
//         }

//         // Verify Token
//         // Verify and decode JWT using the secret key
//         const decodedToken = jwt.verify(token, config.jwtSecret as string) as DecodedJWToken;
//         console.log('Decoded token:', decodedToken);

//         // Check if token is invalid or expired
//         if (!decodedToken) {
//             res.status(401).json({
//                 message: 'Invalid Token'
//             });
//             return; // Stop execution if token verification fails
//         }

//         // Verify user exists in Users table
//         // Verify from the database that a User with the id exist
//         const user = await User.findByPk(decodedToken.id);
//         if (!user) {
//             res.status(401).json({
//                 message: 'Error fetching user'
//             });
//             return; // Stop execution if user is not found
//         }

//         // Handle vendor users
//         if (decodedToken.userType === 'vendor') { // and the person is trying to do anything that has to do with product
//             // For /create-vendor-profile, allow user without Vendor record
//             if (req.path === '/create-vendor-profile') {
//                 req.user = user; // Attach User instance to req.user
//             }

//             // else if(req.path === 'auth/update-profile') {
//             //     // Query Vendors table to find vendor by UserId (linked to Users.id)
//             //     const vendor = await User.findOne({ where: { id: decodedToken.id } });
//             //     if (!vendor) {
//             //         res.status(401).json({
//             //             message: 'Error fetching vendor...Vendor profile not found. Please complete vendor registration.'
//             //         });
//             //         return; // Stop execution if vendor is not found
//             //     }
//             //     req.user = vendor; // Attach Vendor instance to req.user
//             // }

//             else {
//                 // Query Vendors table to find vendor by UserId (linked to Users.id)
//                 const vendor = await Vendor.findOne({ where: { UserId: decodedToken.id } });
//                 if (!vendor) {
//                     res.status(401).json({
//                         message: 'Error fetching vendor...Vendor profile not found. Please complete vendor registration.'
//                     });
//                     return; // Stop execution if vendor is not found
//                 }
//                 req.user = vendor; // Attach Vendor instance to req.user
//             }
//         }
//         else {
//             // Handle non-vendor users (customer or admin)
//             // whatever API this middleware is put on, inside that API you'll have access to the full user object or details
//             //  the logged in user info is stored here...
//             req.user = user; // Attach User instance to req.user
//         }

//         // Proceed to the next middleware or route handler
//         next();
//     } catch (error) {
//         res.status(500).json({
//             message: (error as Error).message
//         });
//     }
// }

// export default validateToken;
