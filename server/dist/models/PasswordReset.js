"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const User_1 = __importDefault(require("./User"));
const PasswordReset = db_1.default.define('PasswordReset', {
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
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
    updatedAt: false //disables only updatedAt
});
PasswordReset.belongsTo(User_1.default);
exports.default = PasswordReset;
