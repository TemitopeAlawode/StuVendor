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
const OrderHistory = db_1.default.define('OrderHistory', {
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
    orderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    orderStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    orderDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: true
});
OrderHistory.belongsTo(User_1.default);
OrderHistory.belongsTo(Product_1.default);
OrderHistory.belongsTo(Vendor_1.default);
exports.default = OrderHistory;
