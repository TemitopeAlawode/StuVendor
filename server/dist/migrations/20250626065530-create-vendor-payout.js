'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('VendorPayouts', {
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
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
                references: { model: 'Vendors', key: 'id' },
            },
            transactionId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            amount: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            transferReference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            type: {
                type: sequelize_1.DataTypes.ENUM('order_split', 'withdrawal'),
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('VendorPayouts');
    }
};
