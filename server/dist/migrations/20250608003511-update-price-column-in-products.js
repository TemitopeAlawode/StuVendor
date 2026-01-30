'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Products', 'price', {
            type: Sequelize.DECIMAL(10, 2), // 10 digits total, 2 after decimal (e.g., up to 99,999,999.99)
            allowNull: false,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Products', 'price');
    }
};
