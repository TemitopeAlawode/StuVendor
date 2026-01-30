"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikedProductsHandler = exports.unlikeProductHandler = exports.likeProductHandler = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const LikedProduct_1 = __importDefault(require("../models/LikedProduct"));
// ================================================
// @desc   Like a product
// @route  POST  /liked-products
// @access Private
// ================================================
const likeProductHandler = async (req, res) => {
    try {
        const { productId } = req.body;
        // Getting user id from JWT middleware/token
        // const userId = req.user?.id;
        const user = req.user;
        let userId = user.UserId || user.id; // UserId for vendors, id for others
        // if (user.userType === 'vendor') {
        //     userId = user.UserId
        // }
        console.log('UserId: ', userId);
        console.log('User Info: ', user);
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }
        if (!productId) {
            res.status(401).json({ message: 'Product ID is required.' });
            return;
        }
        // Check if product exists
        const product = await Product_1.default.findByPk(productId);
        if (!product) {
            res.status(401).json({ message: 'Product not found.' });
            return;
        }
        // Check if the product is already liked
        const existingLike = await LikedProduct_1.default.findOne({ where: { UserId: userId, ProductId: productId } });
        if (existingLike) {
            res.status(401).json({ message: 'Product already liked.' });
            return;
        }
        if (!product.VendorId) {
            res.status(401).json({ message: 'Product already liked.' });
            return;
        }
        // Create Like 
        const likedProduct = await LikedProduct_1.default.create({
            UserId: userId,
            ProductId: productId,
            VendorId: product.VendorId,
            likeTimestamp: new Date(),
        });
        res.status(201).json({ message: 'Product liked successfully.', likedProduct });
    }
    catch (error) {
        console.error('Error liking product: ', error);
        res.status(500).json({ message: 'Failed to like product.' });
    }
};
exports.likeProductHandler = likeProductHandler;
// ================================================
// @desc   Unlike a product
// @route  DELETE  /liked-products/:productId
// @access Private
// ================================================
const unlikeProductHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = req.user;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }
        // Check if the like exist
        const likedProduct = await LikedProduct_1.default.findOne({ where: { UserId: userId, ProductId: productId } });
        if (!likedProduct) {
            res.status(401).json({ message: 'Liked product not found.' });
            return;
        }
        // Delete Liked Product / Remove like
        await likedProduct.destroy();
        res.status(200).json({ message: "Product unliked successfully." });
    }
    catch (error) {
        console.error('Error unliking product:', error);
        res.status(500).json({ message: 'Failed to unlike product.' });
    }
};
exports.unlikeProductHandler = unlikeProductHandler;
// ================================================
// @desc   Get users liked products
// @route  GET  /liked-products
// @access Private
// ================================================
const getLikedProductsHandler = async (req, res) => {
    try {
        const user = req.user;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }
        //  Get all liked products
        const likedProducts = await LikedProduct_1.default.findAll({
            where: { UserId: userId },
            include: [Product_1.default],
        });
        res.status(200).json({ message: 'Liked Products: ', likedProducts });
    }
    catch (error) {
        console.error("Error fetching liked products:", error);
        res.status(500).json({ message: "Failed to fetch liked products." });
    }
};
exports.getLikedProductsHandler = getLikedProductsHandler;
