'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Orders', {
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
            totalAmount: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            shippingAddress: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            transactionId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
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
            customerName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            customerEmail: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            customerPhone: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('Orders');
    }
};
