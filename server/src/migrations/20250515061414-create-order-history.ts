'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'OrderHistories',
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
      UserId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
      },
      ProductId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Products', key: 'id' },
      },
      VendorId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Vendors', key: 'id' },
      },
      orderId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Orders', key: 'id' },
      },
      quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      totalPrice: {
          type: Sequelize.FLOAT,
          allowNull: false,
      },
      orderStatus: {
          type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'pending',
      },
      orderDate: {
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
    await queryInterface.dropTable('OrderHistory');
  }
};

