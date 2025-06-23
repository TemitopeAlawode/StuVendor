'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'Vendors',
      {
        sn: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          unique: true
        },
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        businessName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        phoneNumber: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
          },
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        bankDetails: {
          type: Sequelize.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
          allowNull: true,
        },
        //    Relationship with User model using table names
        UserId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      });
  },

  async down(queryInterface: QueryInterface, Sequelize: any) {
     await queryInterface.dropTable('Vendors');
  }
};
