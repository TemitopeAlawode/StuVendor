"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing dotenv to load env variables
const dotenv_1 = __importDefault(require("dotenv"));
// Loads .env file contents into process.env
dotenv_1.default.config();
// console.log("JWT Secret:", process.env.JWT_SECRET_KEY);
// Configuration object for different environments (e.g., development, production)
const config = {
    // module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres'
    },
    jwtSecret: process.env.JWT_SECRET_KEY,
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        dialect: 'postgres'
    },
    // production: {
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   host: process.env.DB_HOST,
    //   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    //   dialect: 'postgres'
    // }
    //  production: {
    //        use_env_variable: 'DATABASE_URL', // Use single connection string
    //        dialect: 'postgres',
    //        dialectOptions: {
    //          ssl: {
    //            require: true,
    //            rejectUnauthorized: false, // Allow self-signed certs (common in cloud DBs)
    //          },
    //        },
    //        logging: false,
    //      },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: true, // ← change to true
                ca: require('fs').readFileSync('../certs/ca.pem').toString(), // or Buffer if needed
            },
        },
        logging: false,
    },
};
module.exports = config;
// // Importing dotenv to load env variables
// // import dotenv from 'dotenv';
// const dotenv = require('dotenv');
// // Loads .env file contents into process.env
// dotenv.config();
// // console.log("JWT Secret:", process.env.JWT_SECRET_KEY);
// // Configuration object for different environments (e.g., development, production)
// const config = {
// // config = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT, 10),
//     dialect: 'postgres'
//   },
//   jwtSecret: process.env.JWT_SECRET_KEY
//   // production: {
//   //   username: 
//   //   password: 
//   //   database: 
//   //   host: 
//   //   dialect: 'postgres'
//   // }
// }
// module.exports = config;
