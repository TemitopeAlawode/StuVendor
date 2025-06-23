'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('LikedProducts', {
            sn: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                unique: true
            },
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            UserId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
            },
            ProductId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                references: { model: 'Products', key: 'id' },
            },
            VendorId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                references: { model: 'Vendors', key: 'id' },
            },
            likeTimestamp: {
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('LikedProducts');
    }
};
