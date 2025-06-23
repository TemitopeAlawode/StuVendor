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
const ViewedProduct = db_1.default.define('ViewedProduct', {
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    UserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Users', key: 'id' },
    },
    ProductId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Products', key: 'id' },
    },
    VendorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Vendors', key: 'id' },
    },
    viewTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: true
});
ViewedProduct.belongsTo(User_1.default);
ViewedProduct.belongsTo(Product_1.default);
ViewedProduct.belongsTo(Vendor_1.default);
exports.default = ViewedProduct;
