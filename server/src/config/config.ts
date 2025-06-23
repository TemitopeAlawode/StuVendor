// Importing dotenv to load env variables
import dotenv from 'dotenv';

// Loads .env file contents into process.env
dotenv.config();

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
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    dialect: 'postgres'
  }
}

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
