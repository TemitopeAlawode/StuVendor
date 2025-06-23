'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {

     await queryInterface.bulkInsert('Categories', [
      {
        id: 'oiduygcf-gvj4-rtyq-qwetyunvdertg',
       name: 'Food',
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
      id: 'ewqdgjv-gvj4-rtyq-qwet4679dertg',
      name: 'Snacks',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'w3edrftgyuhioiduygcfgvj',
      name: 'Jewelry',  
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'juhytr7e56oiduygcfgvj',
      name: 'Stationery',  
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ], {});
    
  },

  async down (queryInterface: QueryInterface, Sequelize: any) {
 
     await queryInterface.bulkDelete('Categories', {}, {});
  }
};
