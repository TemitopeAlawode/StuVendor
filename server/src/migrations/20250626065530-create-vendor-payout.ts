'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'VendorPayouts',
      {
        sn: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          unique: true,
        },
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        VendorId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'Vendors', key: 'id' },
        },
        transactionId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        transferReference: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM('order_split', 'withdrawal'),
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
  },

  async down(queryInterface: QueryInterface, Sequelize: any) {
    await queryInterface.dropTable('VendorPayouts');
  }
};
