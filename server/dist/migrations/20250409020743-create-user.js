'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4, // Or DataTypes.UUIDV1
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true, // Can be null for Google users
            },
            userType: {
                type: Sequelize.ENUM('customer', 'vendor', 'admin'),
                allowNull: true, // Can be null for Google users
                defaultValue: 'customer', // Default for Google users
            },
            studentStatus: {
                type: Sequelize.BOOLEAN,
                allowNull: true, // Can be null for Google users
                defaultValue: true, // Default for Google users
            },
            googleId: {
                type: Sequelize.STRING,
                allowNull: true, // Can be null for manual registration
            },
            profileCompleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false, // False until user confirms profile
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
        await queryInterface.dropTable('Users');
    }
};
