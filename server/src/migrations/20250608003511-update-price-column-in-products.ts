'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
await queryInterface.changeColumn('Products', 'price', 
  { 
   type: Sequelize.DECIMAL(10, 2), // 10 digits total, 2 after decimal (e.g., up to 99,999,999.99)
  allowNull: false,
  });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.changeColumn('Products', 'price');
  }
};
