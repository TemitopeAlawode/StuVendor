'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
await queryInterface.addColumn('Users', 'verified', 
  { 
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.removeColumn('Users', 'verified');
  }
};


