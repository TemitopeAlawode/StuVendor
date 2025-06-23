"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexAllProductsHandler = exports.getProductsByVendorIdHandler = exports.deleteProductHandler = exports.updateProductHandler = exports.getProductByIdHandler = exports.getProductsHandler = exports.createProductHandler = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
// import { Op } from 'sequelize';
// import  {algoliasearch} from "algoliasearch";
// const algoliasearch = require('algoliasearch');
const { algoliasearch } = require("algoliasearch");
// Initialize Algolia client
// const algoliaClient = (algoliasearch as any)(
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
console.log("algoliaClient:", algoliaClient);
const algoliaIndex = algoliaClient.initIndex("products");
// const algoliaIndex =  algoliaClient.searchSingleIndex({ indexName: 'products' });
// algoliaIndex.search('something', function searchDone(err: any, content: any) {
//   console.log(err, content);
// });
// ================================================
// @desc Create Product
// @route POST /products/add-product
// @access Private (Vendors only)
// ================================================
const createProductHandler = async (req, res) => {
    try {
        const vendor = req.user;
        // console.log('Vendor info:', vendor);
        const { name, description, price, CategoryId, stock } = req.body;
        // const { name, description, price, CategoryId, stock, productImage } = req.body;
        const productImage = req.file ? `/uploads/${req.file.filename}` : "";
        // Validate required fields
        // if (!name || !price || !CategoryId || !stock || !productImage) {
        if (!name || !price || !CategoryId || !stock) {
            res
                .status(400)
                .json({
                message: "All fields (name, price, CategoryId, stock) are required",
            });
            return;
        }
        // Convert price and stock to numbers (handles string inputs like "30000" or "9")
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);
        // Validate data types and ranges
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            res.status(400).json({ message: "Price must be a positive number" });
            return;
        }
        if (isNaN(parsedStock) ||
            !Number.isInteger(parsedStock) ||
            parsedStock < 0) {
            res.status(400).json({ message: "Stock must be a non-negative integer" });
            return;
        }
        // Check if a product with the same name, VendorId, and CategoryId already exists
        const existingProduct = await Product_1.default.findOne({
            where: {
                name,
                VendorId: vendor.id,
                CategoryId,
            },
        });
        if (existingProduct) {
            res
                .status(400)
                .json({
                message: "A product with this name already exists for this vendor and category",
            });
            return;
        }
        // Create the product
        const product = await Product_1.default.create({
            name,
            description: description || "", // Optional, default to empty string if not provided
            price,
            VendorId: vendor.id,
            CategoryId,
            stock,
            productImage,
        });
        // Indexthe new product into Algolia immediately after creation
        await algoliaIndex.saveObject({
            objectID: product.id, // Use product ID as objectID
            name: product.name,
            description: product.description,
            price: product.price,
            category: (await Category_1.default.findByPk(product.CategoryId))?.name || "", // Fetch category name
            stock: product.stock,
            productImage: product.productImage,
            VendorId: product.VendorId,
        });
        console.log("Product info:", product);
        res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating product." });
    }
};
exports.createProductHandler = createProductHandler;
// ================================================
// @desc View Products
// @route GET /products
// @access Public
// ================================================
const getProductsHandler = async (req, res) => {
    try {
        const { categoryId } = req.query;
        // whereClause object, which will be empty (fetch all products) if no categoryId is provided.
        const whereClause = {};
        // If categoryId is provided, filter by it
        if (categoryId) {
            if (typeof categoryId !== "string") {
                res.status(400).json({ message: "Category ID must be a string" });
                return;
            }
            // Verify the category exists
            const category = await Category_1.default.findOne({ where: { id: categoryId } });
            if (!category) {
                res.status(400).json({ message: "Category not found" });
                return;
            }
            whereClause.CategoryId = categoryId;
        }
        // Fetch products with the applied filter (or all products if no filter)
        const products = await Product_1.default.findAll({ where: whereClause });
        if (!products || products.length === 0) {
            res.status(404).json({ message: "No products found" });
            return;
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};
exports.getProductsHandler = getProductsHandler;
// ================================================
// @desc Get Product by Id
// @route GET /products/:id
// @access Public
// ================================================
const getProductByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching product" });
    }
};
exports.getProductByIdHandler = getProductByIdHandler;
// ================================================
// @desc Update a Product
// @route PUT /products/edit/:id
// @access Private
// ================================================
const updateProductHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, CategoryId, stock } = req.body;
        // const { name, description, price, CategoryId, stock, productImage } = req.body;
        const productImage = req.file ? `/uploads/${req.file.filename}` : undefined;
        const vendor = req.user;
        const vendorId = vendor.id; // Assuming verifyToken middleware attaches user to req.user
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (product.VendorId !== vendorId) {
            res
                .status(403)
                .json({
                message: "Unauthorized: You can only update your own products",
            });
            return;
        }
        // Validate and update
        // if (typeof price === 'number' && price < 0) {
        //     res.status(400).json({ message: 'Price must be a positive number' });
        //     return;
        // }
        // if (typeof stock === 'number' && stock < 0) {
        //     res.status(400).json({ message: 'Stock must be a non-negative number' });
        //     return;
        // }
        // Validate inputs if provided
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                res.status(400).json({ message: "Price must be a positive number" });
                return;
            }
        }
        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (isNaN(parsedStock) ||
                !Number.isInteger(parsedStock) ||
                parsedStock < 0) {
                res
                    .status(400)
                    .json({ message: "Stock must be a non-negative integer" });
                return;
            }
        }
        // Number(price) and Number(stock) = parsedPrice and parsedStock respectively
        await product.update({
            name: name || product.name,
            description: description || product.description,
            price: price !== undefined ? Number(price) : product.price,
            CategoryId: CategoryId || product.CategoryId,
            stock: stock !== undefined ? Number(stock) : product.stock,
            productImage: productImage || product.productImage,
        });
        // Update Algolia index
        // Added algoliaIndex.saveObject after the update to reflect changes in the index
        const category = await Category_1.default.findByPk(product.CategoryId);
        await algoliaIndex.saveObject({
            objectID: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: category?.name || '',
            stock: product.stock,
            productImage: product.productImage,
            VendorId: product.VendorId,
        });
        res.status(200).json({ message: "Product updated successfully", product });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating product" });
    }
};
exports.updateProductHandler = updateProductHandler;
// ================================================
// @desc Delete a Product
// @route DELETE /products/:id
// @access Private
// ================================================
const deleteProductHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = req.user;
        const vendorId = vendor.id; // Assuming verifyToken middleware attaches user to req.user
        const product = await Product_1.default.findByPk(id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (product.VendorId !== vendorId) {
            res
                .status(403)
                .json({
                message: "Unauthorized: You can only delete your own products",
            });
            return;
        }
        // Delete Product
        await product.destroy();
        // Added algoliaIndex.deleteObject to remove the product from the index
        await algoliaIndex.deleteObject(product.id); // Remove from Algolia
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting product" });
    }
};
exports.deleteProductHandler = deleteProductHandler;
// ================================================
// @desc Get Products by Vendor Id
// @route GET /products/vendor/:id
// @access Public
// ================================================
const getProductsByVendorIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        // const  id  = (req.user as InstanceType<typeof Vendor>).id;
        const products = await Product_1.default.findAll({ where: { VendorId: id } });
        if (!products || products.length === 0) {
            res.status(404).json({ message: "No products found for this vendor" });
            return;
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products by vendor ID:", error);
        res.status(500).json({ message: "Server error while fetching products" });
    }
};
exports.getProductsByVendorIdHandler = getProductsByVendorIdHandler;
// ================================================
// @desc Handler to index all existing products into Algolia
// ================================================
const indexAllProductsHandler = async (req, res) => {
    try {
        const products = await Product_1.default.findAll({
            include: [{ model: Category_1.default, attributes: ['name'] }],
        });
        const objects = products.map((product) => ({
            objectID: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.Category.name,
            stock: product.stock,
            productImage: product.productImage,
            VendorId: product.VendorId,
        }));
        await algoliaIndex.saveObjects(objects);
        res.status(200).json({ message: 'All products indexed successfully' });
    }
    catch (error) {
        console.error('Indexing error:', error);
        res.status(500).json({ message: 'Error indexing products' });
    }
};
exports.indexAllProductsHandler = indexAllProductsHandler;
// export const getProductsHandler = async (req: Request, res: Response) => {
//     try {
//         const products = await Product.findAll();
//         res.status(200).json(products);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching products' });
//     }
// }
// export const getProductsHandler = async (req: Request, res: Response) => {
//     try {
//         // Filtering display of products by category
//         let { filterCategory } = req.query;
//         // Check if the category really exist
//         if (filterCategory) {
//             if (typeof filterCategory !== 'string') {
//                 res.status(400).json({ message: 'Filter Category must be a string' });
//                 return;
//             }
//             const category = await Category.findOne({ where: { name: {  [Op.iLike]: `%${filterCategory}%` } } }); // // Case-insensitive
//             // const category = await Category.findOne({ where: { name: filterCategory } });
//             if (!category) {
//                 res.status(400).json({ message: 'Category not found' });
//                 return;
//             }
//             // Fetch all products with the specified category
//             const products = await Product.findAll({
//                 where: { CategoryId: category.id }
//             });
//             res.status(200).json(products);
//         }
//         // Display all products without filter
//         const products = await Product.findAll();
//         res.status(200).json(products);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching products' });
//     }
// }
// @desc Get Products
// @route GET /products
// @access Public
// export const getProductsHandler = async (req: Request, res: Response) => {
//   try {
//     const { vendorId, categoryId } = req.query;
//     const whereClause: any = {};
//     if (vendorId) {
//       whereClause.VendorId = vendorId;
//     }
//     if (categoryId) {
//       whereClause.CategoryId = categoryId;
//     }
//     const products = await Product.findAll({ where: whereClause });
//     if (!products || products.length === 0) {
//       res.status(404).json({ message: 'No products found' });
//       return;
//     }
//     res.status(200).json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error while fetching products' });
//   }
// };
