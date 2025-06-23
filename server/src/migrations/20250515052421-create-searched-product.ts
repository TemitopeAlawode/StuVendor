'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'SearchedProducts',
      {
        sn: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          unique: true,
        },
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        UserId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },
        searchQuery: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        ProductId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'Products', key: 'id' },
        },
        VendorId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'Vendors', key: 'id' },
        },
        searchTimestamp: {
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
    await queryInterface.dropTable('SearchedProducts');
  }
};
