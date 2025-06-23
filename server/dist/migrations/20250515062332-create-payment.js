'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Payments', {
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
                references: { model: 'ShoppingCart', key: 'id' },
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Payments');
    }
};
