'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
await queryInterface.addColumn('Users', 'sn', 
  { 
    type: Sequelize.INTEGER,
    autoIncrement: true,
    unique: true 
  });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.removeColumn('Users', 'sn');
  }
};
