'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Vendors', 'bankDetails');
        await queryInterface.addColumn('Vendors', 'bankName', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Vendors', 'bankAccountNumber', {
            type: Sequelize.STRING(10),
            allowNull: true,
        });
        await queryInterface.addColumn('Vendors', 'bankAccountName', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('Vendors', 'bankDetails', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.removeColumn('Vendors', 'bankName');
        await queryInterface.removeColumn('Vendors', 'bankAccountNumber');
        await queryInterface.removeColumn('Vendors', 'bankAccountName');
    }
};
