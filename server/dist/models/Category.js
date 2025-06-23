"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
// Define the base model and cast after defining
const Category = db_1.default.define("Category", {
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        unique: true
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});
// Extend the model with `associate`
Category.associate = (models) => {
    Category.hasMany(models.Product);
};
// (Category as any).associate = (models: Models) => {
//   Category.hasMany(models.Product);
// };
exports.default = Category;
// import { DataTypes, Model } from'sequelize';
// import sequelize from '../db';
// import Product from './Product';
// // Defining an interface for type checking
// interface CategoryAttributes {
//     id: string // UUID is a string
//     name: string
// }
// // Sequelize model instance type
// interface CategoryModel extends Model<CategoryAttributes>, CategoryAttributes {}
// const Category = sequelize.define<CategoryModel>(
//     'Category', {
//   // Defining the fields/columns
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   timestamps: true,
// });
// // // Defining an interface for the models
// interface Models{
//     Product: typeof Product
// }
//   // specifying that Category has an associate or a relationship
// Category.associate = (models: Models) => {
//     Category.hasMany(models.Product);
//   };
// // Category.hasMany(Product);
//   export default Category;
