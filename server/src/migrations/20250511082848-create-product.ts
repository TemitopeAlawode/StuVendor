'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'Products',
      {
        sn: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          unique: true
        },
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        //    Relationship with Vendor and Category model using table names
        VendorId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Vendors', key: 'id' }
        },
        CategoryId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Categories', key: 'id' }
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        productImage: {
          type: Sequelize.STRING,
          allowNull: false
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
    await queryInterface.dropTable('Products');
  }
};
