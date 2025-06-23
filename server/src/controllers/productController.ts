// Importing req and res from express
import { Request, Response } from "express";
import Product from "../models/Product";
import Vendor from "../models/Vendor";
import Category from "../models/Category";
import { Op } from 'sequelize';


// import  {algoliasearch} from "algoliasearch";
// const algoliasearch = require('algoliasearch');
const { algoliasearch } = require("algoliasearch");


// Initialize Algolia client
// const algoliaClient = (algoliasearch as any)(
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_ADMIN_API_KEY as string
);

// console.log("algoliaClient:", algoliaClient);
// const algoliaIndex = algoliaClient.initIndex("products");
// const algoliaIndex =  algoliaClient.searchSingleIndex({ indexName: 'products' });

// Create index if it doesn't exist
async function ensureIndexExists() {
  try {
    await algoliaClient.getSettings({ indexName: "products" });
    console.log("Index 'products' exists");
  } catch (error: any) {
    if (error.status === 404) {
      console.log("Index 'products' does not exist. Creating it...");
      await algoliaClient.setSettings({ indexName: "products", settings: {} });
      console.log("Index 'products' created successfully");
    } else {
      throw error;
    }
  }
}

// Call ensureIndexExists when the module loads
ensureIndexExists().catch((error) => {
  console.error("Failed to ensure index exists:", error);
});






// ================================================
// @desc Create Product
// @route POST /products/add-product
// @access Private (Vendors only)
// ================================================
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const vendor = req.user as InstanceType<typeof Vendor>;
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


    // Validate price
    if (price == null) {
       res.status(400).json({ message: "Price is required." });
       return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
       res.status(400).json({ message: "Price must be a valid number." });
       return;
    }
    if (priceNum < 0) {
       res.status(400).json({ message: "Price cannot be negative." });
    }
    if (priceNum > 99999999.99) {
       res.status(400).json({ message: "Price is too large (max 99,999,999.99)." });
      return;
    }

    // Check decimal places
    const decimalPlaces = (price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
       res.status(400).json({ message: "Price cannot have more than 2 decimal places." });
       return;
    }
    // ----- end of price validation
    
    // Convert stock to numbers (handles string inputs like "30000" or "9")
    const parsedStock = Number(stock);

    if (
      isNaN(parsedStock) ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      res.status(400).json({ message: "Stock must be a non-negative integer" });
      return;
    }

    // Check if a product with the same name, VendorId, and CategoryId already exists
    const existingProduct = await Product.findOne({
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
          message:
            "A product with this name already exists for this vendor and category",
        });
      return;
    }

    // Create the product
    const product = await Product.create({
      name,
      description: description || "", // Optional, default to empty string if not provided
      price,
      VendorId: vendor.id,
      CategoryId,
      stock,
      productImage,
    });

    // Index the new product into Algolia immediately after creation

    // await algoliaIndex.saveObject({
    //   objectID: product.id, // Use product ID as objectID
    //   name: product.name,
    //   description: product.description,
    //   price: product.price,
    //   category: (await Category.findByPk(product.CategoryId))?.name || "", // Fetch category name
    //   stock: product.stock,
    //   productImage: product.productImage,
    //   VendorId: product.VendorId,
    // });

    try {
      await algoliaClient.saveObjects({
        indexName: "products",
        objects: [{
          objectID: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: (await Category.findByPk(product.CategoryId))?.name || "",
          stock: product.stock,
          productImage: product.productImage,
          VendorId: product.VendorId,
        }],
      });
    } catch (algoliaError: any) {
      console.error("Algolia indexing error:", algoliaError.message);
    }

    console.log("Product info:", product);

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product." });
  }
};



// ================================================
// @desc View Products
// @route GET /products
// @access Public
// ================================================
export const getProductsHandler = async (req: Request, res: Response) => {
  try {
    // Get query parameters from the request (?...)
    const { categoryId, search } = req.query;
    // whereClause object, which will be empty (fetch all products) if no categoryId is provided.
    // Object to store filtering conditions
    const whereClause: any = {};

    // If categoryId is provided, filter by it
    if (categoryId) {
      if (typeof categoryId !== "string") {
        res.status(400).json({ message: "Category ID must be a string" });
        return;
      }

      // Verify the category exists
      const category = await Category.findOne({ where: { id: categoryId } });
      if (!category) {
        res.status(400).json({ message: "Category not found" });
        return;
      }
      whereClause.CategoryId = categoryId;
    }

    // Handle search filter if provided
    if (search) {
      if (typeof search !== "string") {
        res.status(400).json({ message: "Search Query must be a string" });
        return;
      }
      // Search condition to filter by product name (case insensitive)
      whereClause.name = {
        [Op.iLike]: `%${search}%` // Matches product name containing the search query term
      };
    }

    // Fetch products with the applied filter (or all products if no filter)
    const products = await Product.findAll({ where: whereClause });
    if (!products || products.length === 0) {
      res.status(404).json({ message: "No products found" });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};




// ================================================
// @desc Get Product by Id
// @route GET /products/:id
// @access Public
// ================================================
export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product" });
  }
};



// ================================================
// @desc Update a Product
// @route PUT /products/edit/:id
// @access Private
// ================================================
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, CategoryId, stock } = req.body;
    // const { name, description, price, CategoryId, stock, productImage } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const vendor = req.user as InstanceType<typeof Vendor>;
    const vendorId = vendor.id; // Assuming verifyToken middleware attaches user to req.user

    const product = await Product.findByPk(id);
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

   // Validate price
    if (price == null) {
       res.status(400).json({ message: "Price is required." });
       return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
       res.status(400).json({ message: "Price must be a valid number." });
       return;
    }
    if (priceNum < 0) {
       res.status(400).json({ message: "Price cannot be negative." });
    }
    if (priceNum > 99999999.99) {
       res.status(400).json({ message: "Price is too large (max ₦99,999,999.99)." });
      return;
    }

    // Check decimal places
    const decimalPlaces = (price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
       res.status(400).json({ message: "Price cannot have more than 2 decimal places." });
       return;
    }


    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (
        isNaN(parsedStock) ||
        !Number.isInteger(parsedStock) ||
        parsedStock < 0
      ) {
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
      price: price !== undefined ? priceNum : product.price,
      CategoryId: CategoryId || product.CategoryId,
      stock: stock !== undefined ? Number(stock) : product.stock,
      productImage: productImage || product.productImage,
    });

    // Update Algolia index
    // Added algoliaIndex.saveObject after the update to reflect changes in the index
    
    // const category = await Category.findByPk(product.CategoryId);
    // await algoliaIndex.saveObject({
    //   objectID: product.id,
    //   name: product.name,
    //   description: product.description,
    //   price: product.price,
    //   category: category?.name || '',
    //   stock: product.stock,
    //   productImage: product.productImage,
    //   VendorId: product.VendorId,
    // });

    try {
      const category = await Category.findByPk(product.CategoryId);
      await algoliaClient.saveObjects({
        indexName: "products",
        objects: [{
          objectID: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: category?.name || "",
          stock: product.stock,
          productImage: product.productImage,
          VendorId: product.VendorId,
        }],
      });
    } catch (algoliaError: any) {
      console.error("Algolia indexing error:", algoliaError.message);
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};



// ================================================
// @desc Delete a Product
// @route DELETE /products/:id
// @access Private
// ================================================
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = req.user as InstanceType<typeof Vendor>;
    const vendorId = vendor.id; // Assuming verifyToken middleware attaches user to req.user

    const product = await Product.findByPk(id);
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

    // await algoliaIndex.deleteObject(product.id); // Remove from Algolia

    try {
      await algoliaClient.deleteObjects({
        indexName: "products",
        objectIDs: [product.id],
      });
    } catch (algoliaError: any) {
      console.error("Algolia deletion error:", algoliaError.message);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};



// ================================================
// @desc Get Products by Vendor Id
// @route GET /products/vendor/:id
// @access Public
// ================================================
export const getProductsByVendorIdHandler = async ( req: Request, res: Response ) => {
  try {
    const { id } = req.params;
    // const  id  = (req.user as InstanceType<typeof Vendor>).id;
    const products = await Product.findAll({ where: { VendorId: id } });

    if (!products || products.length === 0) {
      res.status(404).json({ message: "No products found for this vendor" });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by vendor ID:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};



// ================================================
// Index All Products Handler
// @desc Handler to index all existing products into Algolia
// @route POST /products/index-all-products
// @access Private (admins only)
// ================================================
export const indexAllProductsHandler = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ["name"] }],
    });
    const objects = products.map((product) => ({
      objectID: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.Category?.name || "",
      stock: product.stock,
      productImage: product.productImage,
      VendorId: product.VendorId,
    }));
    await algoliaClient.saveObjects({
      indexName: "products",
      objects,
    });
    res.status(200).json({ message: "All products indexed successfully" });
  } catch (error: any) {
    console.error("Indexing error:", error.message);
    res.status(500).json({ message: "Error indexing products", error: error.message });
  }
};













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
