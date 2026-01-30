'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Vendors', 'bankName', {
            type: Sequelize.STRING,
            allowNull: false,
        });
        await queryInterface.changeColumn('Vendors', 'bankAccountNumber', {
            type: Sequelize.STRING(10),
            allowNull: false,
        });
        await queryInterface.changeColumn('Vendors', 'bankAccountName', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Vendors', 'bankName');
        await queryInterface.changeColumn('Vendors', 'bankAccountNumber');
        await queryInterface.changeColumn('Vendors', 'bankAccountName');
    }
};
