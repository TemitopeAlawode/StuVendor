'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable(
      'Messages',
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
        senderId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: "Users", key: "id" },
        },
        receiverId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: "Users", key: "id" },
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    await queryInterface.dropTable('Messages');
  }
};
