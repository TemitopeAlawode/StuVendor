'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'Reviews',
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
        ProductId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Products', key: 'id' },
        },
        rating: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: { min: 1, max: 5 },
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    await queryInterface.dropTable('Reviews');
  }
};
