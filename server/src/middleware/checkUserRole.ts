//**** */ Middleware to check user role ('admin', 'vendor')
// Middleware to restrict access to routes based on user role (e.g., 'admin', 'vendor')

// Importing User and Vendor model
import User from '../models/User';
import Vendor from '../models/Vendor';
// Importing req, res and next from express
import { Request, Response, NextFunction } from "express";


// Defining interface for type checking
// Interface for User instances to ensure type safety
interface CustomUser {
    id: string
    name: string
    email: string
    password?: string // optional
    userType?: string
    studentStatus?: boolean
    googleId?: string
    profileCompleted: boolean
}

/**
 * Middleware factory to check if the authenticated user has the specified role.
 * Supports both User and Vendor instances from req.user.
 * @param role - The required role (e.g., 'vendor', 'admin')
 * @returns Middleware function to validate user role
 */
const checkUserRole = (role: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if req.user is set by previous middleware (e.g., validateToken)
            if (!req.user) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
              } 

              // Determine user ID based on req.user type
              let userId: string;
              if ('UserId' in req.user) { 
                // then userId is a Vendor instance
                // req.user is a Vendor instance; use UserId to link to Users table
                userId = (req.user as InstanceType<typeof Vendor>).UserId
              } 
              else {
                // req.user is a User instance; use id directly
                userId = (req.user as CustomUser).id;
              }   


           // Query Users table to check/verify userType
            const user = await User.findByPk(userId);
            if (!user || user.userType !== role) {
                res.status(403).json({
                    message: `Access denied, ${role} only..`
                });
                return; // Stop execution if user is not found or role doesn't match
            }
            
            // Role verified; proceed to the next middleware or route handler
            next();
        } catch (error) {
            res.status(500).json({
                message: `Server error checking ${role} privileges.`
            })
        }
    }
}

export default checkUserRole;





















// // Middleware to check user role ('admin', 'vendor')

// // Importing User model
// import User from '../models/User';
// // Importing req, res and next from express
// import { Request, Response, NextFunction } from "express";


//     // Defining interface for type checking
//     interface CustomUser{
//         id: string
//         name: string
//         email: string
//         password?: string // optional
//         userType?: string 
//         studentStatus?: boolean 
//         googleId?: string
//         profileCompleted: boolean
//       }

// const checkUserRole = (role: string) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             // if (!req.user) {
//             //     res.status(401).json({ message: 'User not authenticated' });
//             //     return;
//             //   }     

            
//     // Calling/Using the interface
//             const user = await User.findByPk((req.user as CustomUser).id);
//             if (!user || user.userType !== role) {
//                  res.status(403).json({
//                     message: `Access denied, ${role} only..`
//                 });
//                 return; // This stops the function from going further
//             }
//             next();
//         } catch (error) {
//             res.status(500).json({
//                 message: `Server error checking ${role} privileges.`
//             })
//         }
//     }
// }

// export default checkUserRole;