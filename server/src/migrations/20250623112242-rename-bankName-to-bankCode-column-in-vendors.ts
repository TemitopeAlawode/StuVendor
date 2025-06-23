'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
// Rename the bankName column to bankCode in the Vendors table
    await queryInterface.renameColumn('Vendors', 'bankName', 'bankCode');
  },

  async down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
   // Revert the change by renaming bankCode back to bankName
    await queryInterface.renameColumn('Vendors', 'bankCode', 'bankName');
  }
};
