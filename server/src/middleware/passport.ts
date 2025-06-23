/**
 * Google Authentication Configuration
 * 
 * This file sets up Google OAuth 2.0 authentication strategy using Passport.js
 * It handles user authentication, creation, and session management
 */

// This is for Google Authentication
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
// Import User Model from our models directory
import User from '../models/User';

// Verify that required environment variables for Google OAuth are set
// This prevents the application from starting if credentials are missing
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are missing in environment variables");
}

/**
 * Configure Google strategy in passport to use OAuth credentials
 * 
 * The strategy requires:
 * 1. Configuration object with credentials and callback URL
 * 2. Verify callback function that processes the authenticated user
 */

passport.use(
    new GoogleStrategy({
        // Client ID, Secret, and Callback URL for Google OAuth
        // These values are loaded from environment variables for security
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string
    },

    // This is a JSDoc comment
        /**
         * Verify callback executed when a user is authenticated with Google
         * @param accessToken - OAuth 2.0 access token
         * @param refreshToken - OAuth 2.0 refresh token
         * @param profile - User profile information returned by Google
         * @param done - Callback to pass the user to Passport
         */
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                // Check if the User already exists in the database by Google ID
                let user = await User.findOne({ where: { googleId: profile.id } });

                // If user doesn't exist, create a new user record
                // Passing user profile data from Google to create the user
                if (!user) {
                    user = await User.create({
                        googleId: profile.id, // Store Google ID for future authentication
                        // Optional chaining: This will help if the email is not given in array 
                        email: profile.emails?.[0].value as string, // Store user's primary email
                        name: profile.displayName,  // Store user's display name
                        // userType, studentStatus, use default(customer, true) 
                        // for Google Users before been redirected to complete profile
                        profileCompleted: false,  // This flag indicates the profile needs completion later
                        verified: false // New field to track verification status

                    });
                }

                // Pass the user object to done() for session management
                // First parameter null means no error occurred
                done(null, user);
            } catch (error) {
                // If there's an error during authentication or database operations,
                // pass the error to done function and undefined as the user
                done(error as Error, undefined);
                // Previously: done(error, null) - caused TypeScript error
            }
        })
);

/**
 * Session serialization and deserialization
 * 
 * These functions control how user objects are stored in and retrieved from the session
 */

// Serialize user - determines which data of the user object should be stored in the session
// Using type assertion to handle TypeScript's type checking for the id property
passport.serializeUser((user: any, done) => {
    // Saving only the user's id inside the session for efficiency
    done(null, (user as any).id);
});

// Deserialize user - retrieves the user object using the id from the session
// This makes the user object available as req.user in route handlers
passport.deserializeUser(
    async (id: string, done) => {
        try {
            // Find the full user object by primary key (id) in the database
            const user = await User.findByPk(id);
            done(null, user); // Return the user object for use in the application
        } catch (error) {
            // Handle any errors during user retrieval
            done(error as Error, null);
        }
    });

// Export the configured passport instance for use in the application
export default passport;





























// // This is for Google Authentication
// // Import dotenv to load environment variables from .env file
// import dotenv from 'dotenv';
// dotenv.config(); // Load environment variables

// // Import passport for authentication middleware
// import passport from 'passport';
// // Import Google OAuth 2.0 strategy and types from passport-google-oauth20
// import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
// // Import User model to interact with the database
// import User from '../models/User';

// // Ensure Google OAuth credentials are set in environment variables
// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
//     throw new Error("Google OAuth credentials are missing in environment variables");
// }

// // Configure Google OAuth strategy for Passport
// passport.use(
//     new GoogleStrategy(
//         {
//             // Google OAuth client ID from environment variables
//             clientID: process.env.GOOGLE_CLIENT_ID as string,
//             // Google OAuth client secret from environment variables
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//             // Callback URL to which Google redirects after authentication
//             callbackURL: process.env.GOOGLE_CALLBACK_URL as string
//         },
//         // Verify callback function executed after successful authentication
//         async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
//             try {
//                 // Check if a user with the given Google ID already exists in the database
//                 let user = await User.findOne({ where: { googleId: profile.id } });

//                 // If user does not exist, create a new user record
//                 if (!user) {
//                     user = await User.create({
//                         googleId: profile.id, // Store Google ID from profile
//                         // Use optional chaining to safely access email if available
//                         email: profile.emails?.[0].value, // Store user's email address
//                         name: profile.displayName,  // Store user's display name
//                         // userType and studentStatus default to customer and true respectively
//                         // for Google users before they complete their profile
//                         profileCompleted: false  // Flag to indicate profile completion status
//                     });
//                 }

//                 // Pass the user object to Passport's done callback for session handling
//                 done(null, user);
//             } catch (error) {
//                 // If an error occurs during user lookup or creation, pass error to done callback
//                 done(error, undefined);
//             }
//         }
//     )
// );

// // Serialize user instance to session by storing user ID
// passport.serializeUser((user: any, done) => done(null, (user as any).id)); // Save user ID in session

// // Deserialize user instance from session by retrieving user from database using ID
// passport.deserializeUser(
//     async (id, done) => {
//         try {
//             // Find user by primary key (ID)
//             const user = await User.findByPk(id);
//             // Pass user object to done callback for use in request lifecycle
//             done(null, user);
//         } catch (error) {
//             // Pass any errors to done callback
//             done(error, null);
//         }
//     }
// );

// export default passport;
