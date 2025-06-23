'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Products', {
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Products');
    }
};
