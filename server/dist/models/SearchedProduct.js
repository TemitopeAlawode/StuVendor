"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const User_1 = __importDefault(require("./User"));
const Product_1 = __importDefault(require("./Product"));
const Vendor_1 = __importDefault(require("./Vendor"));
const SearchedProduct = db_1.default.define('SearchedProduct', {
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        unique: true,
    },
    UserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    searchQuery: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ProductId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        // references: { model: 'Products', key: 'id' },
    },
    VendorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        // references: { model: 'Vendors', key: 'id' },
    },
    searchTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: true
});
SearchedProduct.belongsTo(User_1.default);
SearchedProduct.belongsTo(Product_1.default);
SearchedProduct.belongsTo(Vendor_1.default);
exports.default = SearchedProduct;
