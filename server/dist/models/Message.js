"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const User_1 = __importDefault(require("./User"));
const Message = db_1.default.define("Message", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    senderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    receiverId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
});
Message.belongsTo(User_1.default, { foreignKey: "senderId", as: "Sender" });
Message.belongsTo(User_1.default, { foreignKey: "receiverId", as: "Receiver" });
exports.default = Message;
