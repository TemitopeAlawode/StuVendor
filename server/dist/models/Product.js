"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const Vendor_1 = __importDefault(require("./Vendor"));
const Category_1 = __importDefault(require("./Category"));
const Product = db_1.default.define('Product', {
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
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    // price: {
    //   type: DataTypes.FLOAT,
    //   allowNull: false,
    // },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2), // 10 digits total, 2 after decimal (e.g., up to 99,999,999.99)
        allowNull: false,
        validate: {
            isDecimal: {
                msg: "Price must be a valid decimal number.",
            },
            min: {
                args: [0],
                msg: "Price cannot be negative.",
            },
            max: {
                args: [99999999.99], // Matches DECIMAL(10, 2) max value
                msg: "Price is too large (max 99,999,999.99).",
            },
        },
    },
    VendorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Vendors', key: 'id' }
    },
    CategoryId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        // references: { model: 'Categories', key: 'id' }
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    productImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
});
//   Product.associate = (models: Models) => {
//     Product.hasMany(models.Product);
//   }
Product.associate = (models) => {
    Product.hasMany(models.ViewedProduct);
    Product.hasMany(models.SearchedProduct);
    Product.hasMany(models.LikedProduct);
};
Product.belongsTo(Vendor_1.default);
Product.belongsTo(Category_1.default);
exports.default = Product;
