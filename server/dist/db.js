"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const isProduction = process.env.NODE_ENV === 'production';
const sequelize = isProduction
    ? new sequelize_1.Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    })
    : new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        dialect: 'postgres',
        logging: true,
    });
(async () => {
    try {
        await sequelize.authenticate();
        console.log(isProduction
            ? 'Connected to production database'
            : 'Connected to local database');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
exports.default = sequelize;
// import { Sequelize } from 'sequelize';
// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     // convert process.env.DB_PORT from string to number (e.g., using parseInt 
//     // or Number) before passing it to Sequelize.
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
//     dialect: 'postgres'
//   });
// (async () => {
//     try {
//         // Initiates connection to database from your code; it's a bridge between API Server and database 
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//       }
// }) ();
//  // export sequelize
//  export default sequelize;
//  import { Sequelize } from 'sequelize';
// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres'
//   });
// (async () => {
//     try {
//         // Initiates connection to database from your code; it's a bridge between API Server and database 
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//       }
// }) ();
//  // export sequelize
//  export default sequelize;
