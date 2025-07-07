'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'OrderProducts',
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
      OrderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('OrderProducts');
  }
};
