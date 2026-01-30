'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Rename the bankName column to bankCode in the Vendors table
        await queryInterface.renameColumn('Vendors', 'bankName', 'bankCode');
    },
    async down(queryInterface, Sequelize) {
        // Revert the change by renaming bankCode back to bankName
        await queryInterface.renameColumn('Vendors', 'bankCode', 'bankName');
    }
};
