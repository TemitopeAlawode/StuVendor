'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
await queryInterface.addColumn('Vendors', 'profilePicture', 
  { 
    type: Sequelize.STRING,
    allowNull: true
    // allowNull: false
  });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.removeColumn('Vendors', 'profilePicture');
  }
};
