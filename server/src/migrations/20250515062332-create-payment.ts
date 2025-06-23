'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'Payments',
      {
        sn: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
        //   unique: true,
        },
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        UserId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },
        ShoppingCartId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'ShoppingCarts', key: 'id' },
        },
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        paymentStatus: {
          type: Sequelize.ENUM('pending', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        // Unique ID from the payment gateway (e.g., Paystack).
        transactionId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        paymentTimestamp: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
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
    await queryInterface.dropTable('Payments');
  }
};
