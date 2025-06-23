'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Vendors', 'profilePicture', {
            type: Sequelize.STRING,
            allowNull: true
            // allowNull: false
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Vendors', 'profilePicture');
    }
};
