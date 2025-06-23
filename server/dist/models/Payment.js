"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const User_1 = __importDefault(require("./User"));
const ShoppingCart_1 = __importDefault(require("./ShoppingCart"));
const Payment = db_1.default.define('Payment', {
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        //   unique: true,
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    UserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    ShoppingCartId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'ShoppingCart', key: 'id' },
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    // Unique ID from the payment gateway (e.g., Paystack).
    transactionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    paymentTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: true
});
Payment.belongsTo(User_1.default);
Payment.belongsTo(ShoppingCart_1.default);
exports.default = Payment;
