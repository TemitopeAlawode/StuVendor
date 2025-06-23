"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing necessary Sequelize dependencies: DataTypes for defining column types,
// Model for creating the model class, and ModelStatic for typing model constructors.
const sequelize_1 = require("sequelize");
// Importing the configured Sequelize instance for database connection.
const db_1 = __importDefault(require("../db"));
// Defining the User model using sequelize.define, specifying the model name, attributes, and options.
// The generic type UserInstance ensures type safety for the model's instances.
const User = db_1.default.define('User', // Model name, maps to the 'User' table in the database.
{
    // Defining the model's attributes (columns) with their data types, constraints, and validations.
    id: {
        type: sequelize_1.DataTypes.UUID, // UUID type for unique identifier.
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Automatically generates a UUID v4 for new records.
        primaryKey: true, // Marks this field as the primary key.
    },
    name: {
        type: sequelize_1.DataTypes.STRING, // String type for the user's name.
        allowNull: false, // Required field, cannot be null.
    },
    email: {
        type: sequelize_1.DataTypes.STRING, // String type for the user's email.
        allowNull: false, // Required field, cannot be null.
        unique: true, // Ensures email addresses are unique across users.
        validate: {
            isEmail: true // Validates that the value is a valid email format.
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING, // String type for the user's password (typically hashed).
        allowNull: true, // Nullable to support Google-authenticated users who don't set a password.
    },
    userType: {
        type: sequelize_1.DataTypes.ENUM('customer', 'vendor', 'admin'), // Enum type restricting values to specific roles.
        allowNull: true, // Nullable to support Google-authenticated users.
        defaultValue: 'customer', // Defaults to 'customer' for new users.
    },
    studentStatus: {
        type: sequelize_1.DataTypes.BOOLEAN, // Boolean type for student status.
        allowNull: true, // Nullable to support Google-authenticated users.
        defaultValue: true, // Defaults to true for new users.
    },
    googleId: {
        type: sequelize_1.DataTypes.STRING, // String type for Google ID (for OAuth users).
        allowNull: true, // Nullable for users who register manually without Google.
    },
    profileCompleted: {
        type: sequelize_1.DataTypes.BOOLEAN, // Boolean type to track profile completion status.
        allowNull: false, // Required field, cannot be null.
        defaultValue: false, // Defaults to false until the user completes their profile.
    },
    verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt columns to track record creation/update times.
});
// Extending the User model to define associations with other models.
// The associate method is added to the model to establish relationships dynamically.
User.associate = (models) => {
    // Defining one-to-many relationships between User and other models.
    // A User can have multiple associated records in each related model.
    User.hasMany(models.Vendor); // A User can have many Vendors (e.g., if userType is 'vendor').
    User.hasMany(models.ViewedProduct); // A User can have many ViewedProduct records.
    User.hasMany(models.SearchedProduct); // A User can have many SearchedProduct records.
    User.hasMany(models.LikedProduct); // A User can have many LikedProduct records.
    User.hasMany(models.ShoppingCart); // A User can have many ShoppingCart records.
    User.hasMany(models.Payment); // A User can have many Payment records.
};
// Exporting the User model for use in other parts of the application.
exports.default = User;
// import { DataTypes, Model, ModelStatic } from 'sequelize';
// import sequelize from '../db';
// // Import type of Vendor model
// // import Vendor from '../models/Vendor';
// // Define the attributes
// interface UserAttributes {
//     id?: string;
//     name: string;
//     email: string;
//     password?: string;
//     userType?: 'customer' | 'vendor' | 'admin';
//     studentStatus?: boolean;
//     googleId?: string;
//     profileCompleted: boolean;
// }
// // Define the instance type
// interface UserInstance extends Model<UserAttributes>, UserAttributes { }
// // Define Models object for associate
// // ModelStatic: a type representing a Sequelize model constructor 
// // (the return type of sequelize.define).
// interface Models {
//     Vendor: ModelStatic<Model>;
//     ViewedProduct: ModelStatic<Model>;
//     SearchedProduct: ModelStatic<Model>;
//     ShoppingCart: ModelStatic<Model>;
//     Payment: ModelStatic<Model>;
// }
// const User = sequelize.define<UserInstance>(
//     'User',
//     {
//         // Model attributes are defined here
//         id: {
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
//             primaryKey: true,
//         },
//         name: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         email: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             unique: true,
//             validate: {
//                 isEmail: true
//             }
//         },
//         password: {
//             type: DataTypes.STRING,
//             allowNull: true, // Can be null for Google users
//         },
//         userType: {
//             type: DataTypes.ENUM('customer', 'vendor', 'admin'),
//             allowNull: true,  // Can be null for Google users
//             defaultValue: 'customer', // Default for Google users
//         },
//         studentStatus: {
//             type: DataTypes.BOOLEAN,
//             allowNull: true,  // Can be null for Google users
//             defaultValue: true,  // Default for Google users
//         },
//         googleId: { // For Google users
//             type: DataTypes.STRING,
//             allowNull: true,  // Can be null for manual registration
//         },
//         profileCompleted: {
//             type: DataTypes.BOOLEAN,
//             allowNull: false,
//             defaultValue: false,  // False until user confirms profile
//         },
//     },
//     {
//         timestamps: true
//     },
// );
// // Defining an interface for the models
// // interface Models{
// //     Vendor: typeof Vendor
// //     ViewedProduct: any
// //     SearchedProduct: any
// //     ShoppingCart: any
// //     Payment: any
// // }
// // Specifying that User has a relationship with other models
// // User.associate = (models: Models) => {
// //     User.hasMany(models.Vendor);
// //     User.hasMany(models.ViewedProduct);
// //     User.hasMany(models.SearchedProduct);
// //     User.hasMany(models.ShoppingCart);
// //     User.hasMany(models.Payment);
// // };
// // Extend the model with `associate`
// (User as typeof User & { associate?: (models: Models) => void }).associate = (models: Models) => {
//     User.hasMany(models.Vendor);
//     User.hasMany(models.ViewedProduct);
//     User.hasMany(models.SearchedProduct);
//     User.hasMany(models.ShoppingCart);
//     User.hasMany(models.Payment);
// };
// export default User;
