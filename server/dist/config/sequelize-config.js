"use strict";
// src/config/sequelize-config.ts
// This file is specifically for Sequelize CLI
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        dialect: 'postgres'
    },
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
