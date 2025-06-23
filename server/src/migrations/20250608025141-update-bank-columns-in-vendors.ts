'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.changeColumn('Vendors', 'bankName', 
  { 
    type: Sequelize.STRING,
    allowNull: false,
  });
  await queryInterface.changeColumn('Vendors', 'bankAccountNumber', 
  { 
    type: Sequelize.STRING(10),
    allowNull: false,
  });
   await queryInterface.changeColumn('Vendors', 'bankAccountName', 
  { 
    type: Sequelize.STRING,
    allowNull: false,
  });
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.changeColumn('Vendors', 'bankName');
  await queryInterface.changeColumn('Vendors', 'bankAccountNumber');
  await queryInterface.changeColumn('Vendors', 'bankAccountName');
  }
};

