"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSearchedProductHandler = void 0;
const SearchedProduct_1 = __importDefault(require("../models/SearchedProduct"));
// ================================================
// @desc  Save a search query and products to the database
// @route  POST  /searched-products
// @access Private
// ================================================
const saveSearchedProductHandler = async (req, res) => {
    try {
        const { searchQuery, ProductId, VendorId } = req.body;
        const user = req.user;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }
        if (!searchQuery) {
            res.status(401).json({ message: 'Search query is required.' });
            return;
        }
        // Create a new entry in the SearchedProduct table
        const searchedProduct = await SearchedProduct_1.default.create({
            UserId: userId,
            searchQuery,
            ProductId,
            VendorId,
            searchTimestamp: new Date()
        });
        res.status(201).json({ message: 'Search saved successfully.', searchedProduct });
    }
    catch (error) {
        console.error('Error saving search query/product: ', error);
        res.status(500).json({ message: 'Failed to save search query/product.' });
    }
};
exports.saveSearchedProductHandler = saveSearchedProductHandler;
