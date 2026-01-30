// src/config/sequelize-config.ts
// This file is specifically for Sequelize CLI

import dotenv from 'dotenv';

const fs = require('fs');
const path = require('path');

dotenv.config();

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
      rejectUnauthorized: true,
     ca: fs.readFileSync(path.join(process.cwd(), 'certs', 'ca.pem')),
    },
  },
  logging: false,
},
};




