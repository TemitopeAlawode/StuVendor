"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVendorMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
/**
 * Configure Multer storage for file uploads.
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
/**
 * Filter uploaded files to allow only specific image types.
 */
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    }
};
/**
 * Multer upload instance
 */
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
});
exports.default = upload;
/**
 * Middlewares
 */
exports.uploadMiddleware = upload.single('productImage');
exports.uploadVendorMiddleware = upload.single('profilePicture');
// import multer from 'multer';
// import path from 'path';
// /**
//  * Configure Multer storage for file uploads.
//  * Defines where files are saved and how they are named.
//  */
// const storage = multer.diskStorage({
//   /**
//    * Specify the destination directory for uploaded files.
//    * @param req - Express request object
//    * @param file - Uploaded file object
//    * @param cb - Callback to specify the destination
//    */
//   destination: (req, file, cb) => {
//     // cb(null, 'uploads/'); // Save files to the 'uploads/' directory
//     cb(null, 'src/uploads/'); // Save files to the 'src/uploads/' directory
//   },
//   /**
//    * Generate a unique filename for each uploaded file.
//    * Uses a timestamp prefix to avoid name conflicts.
//    * @param req - Express request object
//    * @param file - Uploaded file object
//    * @param cb - Callback to specify the filename
//    */
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Format: timestamp-originalname (e.g., 1698765432112-image.jpg)
//   },
// });
// /**
//  * Filter uploaded files to allow only specific image types (jpeg, jpg, png).
//  * Validates both file extension and MIME type for security.
//  * @param req - Express request object
//  * @param file - Uploaded file object
//  * @param cb - Callback to accept or reject the file
//  */
// const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   // Define allowed image file types using a regular expression
//   const filetypes = /jpeg|jpg|png/;
//   // Check if file extension matches allowed types (case-insensitive)
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check if MIME type matches allowed types
//   const mimetype = filetypes.test(file.mimetype);
//   // Accept file if both extension and MIME type are valid
//   if (extname && mimetype) {
//     return cb(null, true);
//   }
//   // Reject file with an error if validation fails
//   cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
// };
// /**
//  * Configure Multer instance for file uploads.
//  * Applies storage, file filter, and file size limits.
//  */
// const upload = multer({
//   storage, // Use the defined storage configuration
//   fileFilter, // Apply the image file type filter
//   limits: { fileSize: 1024 * 1024 * 2 }, // Limit file size to 2MB
// });
// // Export the Multer instance for use in routes
// export default upload;
// /**
//  * Middleware to handle single file upload for the 'productImage' field.
//  * Processes the uploaded file and attaches it to req.file.
//  * @example Used in routes like: router.post('/products/add-product', uploadMiddleware, createProductHandler);
//  */
// export const uploadMiddleware = upload.single('productImage');
// export const uploadVendorMiddleware = upload.single('profilePicture');
// import multer from "multer";
// import path from 'path';
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); // Directory to save files
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`); // Unique filename with timestamp
//     },
//   });
//   const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (extname && mimetype) {
//       return cb(null, true);
//     }
//     cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
//   };
//   const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
//   });
//   export default upload;
// // Middleware to handle file upload
//   export const uploadMiddleware = upload.single('productImage');
