"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViewedProductHandler = void 0;
const ViewedProduct_1 = __importDefault(require("../models/ViewedProduct"));
const sequelize_1 = require("sequelize");
// ================================================
// @desc  Save a viewed products to the database
// @route  POST  /viewed-products
// @access Private
// ================================================
const createViewedProductHandler = async (req, res) => {
    try {
        const { ProductId, VendorId } = req.body;
        const user = req.user;
        const UserId = user.UserId || user.id; // UserId for vendors, id for others
        if (!UserId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }
        if (!ProductId || !VendorId) {
            res.status(400).json({ message: 'ProductId and VendorId are required' });
            return;
        }
        // Check for duplicate view within a short time frame (e.g., 1 hour) to avoid spam
        const recentView = await ViewedProduct_1.default.findOne({
            where: {
                UserId,
                ProductId,
                viewTimestamp: {
                    [sequelize_1.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                }
            }
        });
        if (recentView) {
            res.status(200).json({ message: 'View already recorded recently' });
            return;
        }
        // Create new viewed product entry
        const viewedProduct = await ViewedProduct_1.default.create({
            UserId,
            ProductId,
            VendorId,
            viewTimestamp: new Date(),
        });
        res.status(201).json({ message: 'Product view successfully recorded.', viewedProduct });
    }
    catch (error) {
        console.error('Error saving viewed product:', error);
        res.status(500).json({ message: 'Failed to save viewed products.' });
    }
};
exports.createViewedProductHandler = createViewedProductHandler;
