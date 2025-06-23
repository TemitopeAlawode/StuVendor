'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'sn', {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'sn');
    }
};
