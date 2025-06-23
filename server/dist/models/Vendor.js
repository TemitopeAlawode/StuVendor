"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const User_1 = __importDefault(require("./User"));
const Vendor = db_1.default.define('Vendor', {
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
    businessName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    bankDetails: {
        type: sequelize_1.DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
        allowNull: true,
    },
    UserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Users', key: 'id' },
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
        // allowNull: false
    }
}, {
    timestamps: true,
});
// Extend the model with `associate`
Vendor.associate = (models) => {
    Vendor.hasMany(models.Product);
    User_1.default.hasMany(models.ViewedProduct);
    User_1.default.hasMany(models.SearchedProduct);
    User_1.default.hasMany(models.LikedProduct);
};
Vendor.belongsTo(User_1.default);
exports.default = Vendor;
// import { DataTypes, ModelStatic, Model } from 'sequelize';
// import sequelize from '../db';
// import User from './User';
// interface Models {
//   Product: ModelStatic<Model>;
// }
// interface VendorModel extends ModelStatic<Model> {
//   associate?: (models: Models) => void;
// }
// const Vendor: VendorModel = sequelize.define(
//   'Vendor',
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     businessName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     phoneNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
//       },
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     bankDetails: {
//       type: DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// Vendor.associate = (models: Models) => {
//   Vendor.hasMany(models.Product);
// };
// Vendor.belongsTo(User);
// export default Vendor;
// import { DataTypes } from'sequelize';
// import sequelize from '../db';
// import User from './User';
// const Vendor = sequelize.define(
//   'Vendor',
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     businessName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     phoneNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
//       },
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     bankDetails: {
//       type: DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// // Defining an interface for the models
// interface Models{
//   Product: any
// }
// Vendor.associate = (models: Models) => {
//   Vendor.hasMany(models.Product);
// }
// Vendor.belongsTo(User);
// export default Vendor;
