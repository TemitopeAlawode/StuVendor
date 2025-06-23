// Import required modules from Express and Sequelize for handling HTTP requests and database operations
import { Request, Response } from 'express'; // Express types for HTTP request/response handling
import { Op, Sequelize } from 'sequelize'; // Sequelize operators (Op) for complex queries (e.g., IN, NOT) and Sequelize for raw SQL functions
import LikedProduct from '../models/LikedProduct'; // Sequelize model for the LikedProducts table, tracking user likes
import ViewedProduct from '../models/ViewedProduct'; // Sequelize model for the ViewedProducts table, tracking product views
import SearchedProduct from '../models/SearchedProduct'; // Sequelize model for the SearchedProducts table, tracking search history
import ShoppingCart from '../models/ShoppingCart'; // Sequelize model for the ShoppingCart table, tracking cart items
import Product from '../models/Product'; // Sequelize model for the Products table, containing product details
import Vendor from '../models/Vendor'; // Sequelize model for the Vendors table, mapping users to vendor IDs

// Define the User interface to type the req.user object, set by JWT authentication middleware
interface User {
    id: string; // Unique user ID from the Users table (used for customers/admins)
    UserId: string; // Alternative ID for vendors (often same as id, for compatibility with vendor-specific logic)
}


// ================================================
// @desc  Fetch personalized product recommendations based on user interactions
// @route GET /api/recommended-products
// @access Private 
// @returns JSON object with recommendedProducts array containing up to 10 products
// ================================================
export const getRecommendedProducts = async (req: Request, res: Response) => {
    try {
        // Step 1: Authenticate the user
        // Check if req.user is set by JWT middleware (indicating a valid token)
        if (!req.user) {
            // If no user data, return 401 Unauthorized with an error message
            res.status(401).json({ message: 'Unauthorized: No user data' });
            return; // Exit the function to prevent further processing
        }

        // Step 2: Extract user information
        // Cast req.user to the User interface for TypeScript type safety
        const user = req.user as User;
        // Extract UserId, preferring UserId (for vendors) or falling back to id (for customers/admins)
        const UserId = user.UserId || user.id;
        // Log UserId for debugging to verify correct user identification
        console.log('UserId:', UserId);

        // Validate UserId to ensure it’s not undefined or empty
        if (!UserId) {
            // Return 401 if UserId is invalid, preventing further processing
            res.status(401).json({ message: 'Unauthorized: Invalid user data' });
            return;
        }

        // Step 3: Fetch vendor ID for exclusion
        // Query the Vendors table to find the vendor record associated with the UserId
        const vendor = await Vendor.findOne({ where: { UserId } });
        // Extract the vendor’s ID (Vendors.id), or set to null if the user is not a vendor
        const vendorId = vendor?.id || null;
        // Log vendorId for debugging to verify correct mapping (e.g., '123e4567-e89b-12d3-a456-426614174000')
        console.log('VendorId:', vendorId);

        // Step 4: Fetch user interactions to build a preference profile
        // Query LikedProducts to get up to 50 most recent products the user liked
        const likedProducts = await LikedProduct.findAll({
            where: { UserId }, // Filter by the user’s ID
            include: [
                {
                    model: Product, // Join with Products table to access CategoryId and VendorId
                    attributes: ['id', 'CategoryId', 'VendorId'], // Fetch only necessary fields for efficiency
                    required: false, // Use LEFT JOIN to include likes even if the product is deleted
                },
            ],
            limit: 50, // Cap at 50 to balance performance and relevance
            order: [['likeTimestamp', 'DESC']], // Sort by most recent likes for recency
        });

        // Query ViewedProducts to get up to 50 most recent products the user viewed
        const viewedProducts = await ViewedProduct.findAll({
            where: { UserId },
            include: [{ model: Product, attributes: ['id', 'CategoryId', 'VendorId'], required: false }],
            limit: 50,
            order: [['viewTimestamp', 'DESC']], // Sort by most recent views
        });

        // Query SearchedProducts, only including searches with a valid ProductId
        const searchedProducts = await SearchedProduct.findAll({
            where: { UserId, ProductId: { [Op.ne]: null } }, // Exclude searches without a ProductId
            include: [{ model: Product, attributes: ['id', 'CategoryId', 'VendorId'], required: false }],
            limit: 50,
            order: [['searchTimestamp', 'DESC']], // Sort by most recent searches
        });

        // Query ShoppingCart to get up to 50 items in the user’s cart
        const cartProducts = await ShoppingCart.findAll({
            where: { UserId },
            include: [{ model: Product, attributes: ['id', 'CategoryId', 'VendorId'], required: false }],
            limit: 50, // No sorting, as cart items aren’t timestamp-prioritized
        });

        // Log interaction counts for debugging to verify data availability
        // Example: Liked: 7, Viewed: 7, Searched: 8, Cart: 5
        console.log('Liked:', likedProducts.length);
        console.log('Viewed:', viewedProducts.length);
        console.log('Searched:', searchedProducts.length);
        console.log('Cart:', cartProducts.length);

        // Step 5: Build user preference profile
        // Initialize objects to store scores for categories and vendors
        const categoryScores: { [key: string]: number } = {}; // Maps CategoryId to a preference score
        const vendorScores: { [key: string]: number } = {}; // Maps VendorId to a preference score

        // Helper function to update category and vendor scores based on interactions
        const updateScores = (product: any, weight: number) => {
            // Extract CategoryId and VendorId from the joined Product data
            const CategoryId = product?.Product?.CategoryId;
            const VendorId = product?.Product?.VendorId;
            // If CategoryId exists, increment its score by the specified weight
            if (CategoryId) {
                categoryScores[CategoryId] = (categoryScores[CategoryId] || 0) + weight;
            }
            // If VendorId exists, increment its score by the specified weight
            if (VendorId) {
                vendorScores[VendorId] = (vendorScores[VendorId] || 0) + weight;
            }
        };

        // Assign weights to interactions to reflect preference strength
        // Likes (0.4): Strongest signal, as liking is a deliberate action
        likedProducts.forEach((lp) => updateScores(lp, 0.4));
        // Cart items (0.3): Indicates strong purchase intent
        cartProducts.forEach((cp) => updateScores(cp, 0.3));
        // Views (0.2): Suggests moderate interest, as viewing is passive
        viewedProducts.forEach((vp) => updateScores(vp, 0.2));
        // Searches (0.1): Weakest signal, as searches may be exploratory
        searchedProducts.forEach((sp) => updateScores(sp, 0.1));

        // Step 6: Select top preferences
        // Get the top 5 categories by score
        let topCategories = Object.entries(categoryScores) // Convert to [CategoryId, score] pairs
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score in descending order
            .slice(0, 5) // Take the top 5
            .map(([CategoryId]) => CategoryId); // Extract CategoryId values

        // Get the top 5 vendors by score
        let topVendors = Object.entries(vendorScores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .slice(0, 5)
            .map(([VendorId]) => VendorId);

        // Log scores and top selections for debugging
        
        console.log('Category Scores:', categoryScores);
        console.log('Top Categories:', topCategories);
        console.log('Vendor Scores:', vendorScores);
        console.log('Top Vendors:', topVendors);

        // Step 7: Expand preferences if insufficient
        // If fewer than 3 categories, supplement with popular categories
        if (topCategories.length < 3) {
            // Query Products to find categories with the most products
            const popularCategories = await Product.findAll({
                attributes: ['CategoryId'], // Only fetch CategoryId
                group: ['CategoryId'], // Group by CategoryId
                order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']], // Sort by product count
                limit: 5, // Take top 5
            });
            // Extract CategoryIds, excluding those already in topCategories
            const additionalCategories = popularCategories
                .map((p) => p.CategoryId)
                .filter((id): id is string => !!id && !topCategories.includes(id));
            // Combine and limit to 5 categories
            topCategories = [...topCategories, ...additionalCategories].slice(0, 5);
            console.log('Expanded Categories:', topCategories);
        }

        // If fewer than 3 vendors, supplement with popular vendors
        if (topVendors.length < 3) {
            // Query Products to find vendors with the most products
            const popularVendors = await Product.findAll({
                attributes: ['VendorId'],
                group: ['VendorId'],
                order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
                limit: 5,
            });
            // Extract VendorIds, excluding those already in topVendors
            const additionalVendors = popularVendors
                .map((p) => p.VendorId)
                .filter((id): id is string => !!id && !topVendors.includes(id));
            // Combine and limit to 5 vendors
            topVendors = [...topVendors, ...additionalVendors].slice(0, 5);
            console.log('Expanded Vendors:', topVendors);
        }

        // Step 8: Identify interacted products to exclude
        // Collect unique ProductIds from all interactions to avoid recommending familiar products
        const interactedProductIds = [
            ...new Set([ // Use Set to remove duplicates
                ...likedProducts.map((lp) => lp.ProductId), // Liked product IDs
                ...viewedProducts.map((vp) => vp.ProductId), // Viewed product IDs
                ...searchedProducts.map((sp) => sp.ProductId).filter((id): id is string => !!id), // Searched product IDs
                ...cartProducts.map((cp) => cp.ProductId), // Cart product IDs
            ]),
        ];
        // Log the count of interacted products for debugging
        console.log('Interacted Product IDs:', interactedProductIds.length);

        // Step 9: Count available products for debugging
        // Count products in topCategories, excluding the vendor’s own products if applicable
        const availableProducts = await Product.count({
            where: {
                CategoryId: { [Op.in]: topCategories }, // Must be in top categories
                ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}), // Exclude vendor’s products if user is a vendor
            },
        });
        // Log count to verify sufficient candidate products
        console.log('Available Products in Top Categories:', availableProducts);

        // Step 10: Fetch recommended products
        // Query Products for up to 10 products matching the criteria
        let recommendedProducts = await Product.findAll({
            where: {
                CategoryId: { [Op.in]: topCategories }, // Must be in top categories
                id: { [Op.notIn]: interactedProductIds }, // Exclude interacted products
                ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}), // Exclude vendor’s own products
            },
            attributes: [
                'id', // Product ID
                'name', // Product name
                'description', // Product description
                'price', // Product price
                'CategoryId', // Category ID
                'VendorId', // Vendor ID
                'stock', // Available stock
                'productImage', // Product image URL
            ], // Fields needed for frontend display
            limit: 10, // Return up to 10 products
            order: [['price', 'ASC']], // Sort by price ascending for affordability
        });

        // Log the number of recommended products and their VendorIds for debugging
        console.log('Recommended Products:', recommendedProducts.length);
        console.log(
            'Recommended Product VendorIds:',
            recommendedProducts.map((p) => p.VendorId)
        );

        // Step 11: Handle sparse data with fallbacks
        // Retry without excluding interacted products if none found
        if (recommendedProducts.length === 0 && interactedProductIds.length > 0) {
            console.log('Retrying without exclusion');
            recommendedProducts = await Product.findAll({
                where: {
                    CategoryId: { [Op.in]: topCategories },
                    ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}),
                },
                attributes: [
                    'id',
                    'name',
                    'description',
                    'price',
                    'CategoryId',
                    'VendorId',
                    'stock',
                    'productImage',
                ],
                limit: 10,
                order: [['price', 'ASC']],
            });
            console.log('Recommended Products (No Exclusion):', recommendedProducts.length);
            console.log(
                'Recommended Product VendorIds (No Exclusion):',
                recommendedProducts.map((p) => p.VendorId)
            );
        }

        // Fallback: Category-only recommendations
        if (recommendedProducts.length === 0) {
            console.log('Retrying with categories only');
            recommendedProducts = await Product.findAll({
                where: {
                    CategoryId: { [Op.in]: topCategories },
                    id: { [Op.notIn]: interactedProductIds },
                    ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}),
                },
                attributes: [
                    'id',
                    'name',
                    'description',
                    'price',
                    'CategoryId',
                    'VendorId',
                    'stock',
                    'productImage',
                ],
                limit: 10,
                order: [['price', 'ASC']],
            });
            console.log('Recommended Products (Categories Only):', recommendedProducts.length);
            console.log(
                'Recommended Product VendorIds (Categories Only):',
                recommendedProducts.map((p) => p.VendorId)
            );
        }

        // Fallback: Vendor-only recommendations
        if (recommendedProducts.length === 0) {
            console.log('Retrying with vendors only');
            recommendedProducts = await Product.findAll({
                where: {
                    VendorId: { [Op.in]: topVendors }, // Focus on preferred vendors
                    id: { [Op.notIn]: interactedProductIds },
                    ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}),
                },
                attributes: [
                    'id',
                    'name',
                    'description',
                    'price',
                    'CategoryId',
                    'VendorId',
                    'stock',
                    'productImage',
                ],
                limit: 10,
                order: [['price', 'ASC']],
            });
            console.log('Recommended Products (Vendors Only):', recommendedProducts.length);
            console.log(
                'Recommended Product VendorIds (Vendors Only):',
                recommendedProducts.map((p) => p.VendorId)
            );
        }

        // Final fallback: Popular products
        if (recommendedProducts.length === 0) {
            console.log('Retrying with popular products');
            const popularProducts = await Product.findAll({
                where: {
                    ...(vendorId ? { VendorId: { [Op.ne]: vendorId } } : {}), // Exclude vendor’s products
                },
                limit: 10,
                order: [['stock', 'DESC']], // Sort by stock as a proxy for popularity
                attributes: [
                    'id',
                    'name',
                    'description',
                    'price',
                    'CategoryId',
                    'VendorId',
                    'stock',
                    'productImage',
                ],
            });
            console.log('Fallback Popular Products:', popularProducts.length);
            console.log(
                'Popular Product VendorIds:',
                popularProducts.map((p) => p.VendorId)
            );
            // Return popular products as the final fallback
            res.status(200).json({ recommendedProducts: popularProducts });
            return;
        }

        // Step 12: Return successful response
        // Return the recommended products in a JSON response for the frontend
        res.status(200).json({ recommendedProducts });
    } catch (error: any) {
        // Step 13: Handle errors
        // Log any errors (e.g., database connection issues) for debugging
        console.error('Error fetching recommended products:', error);
        // Return 500 Internal Server Error with the error message
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
























// // Import required modules from Express and Sequelize
// import { Request, Response } from 'express'; // Express types for handling HTTP requests and responses
// import { Op, Sequelize } from 'sequelize'; // Sequelize operators (Op) for complex queries and Sequelize for raw SQL functions
// import LikedProduct from '../models/LikedProduct'; // Sequelize model for liked products
// import ViewedProduct from '../models/ViewedProduct'; // Sequelize model for viewed products
// import SearchedProduct from '../models/SearchedProduct'; // Sequelize model for searched products
// import ShoppingCart from '../models/ShoppingCart'; // Sequelize model for cart items
// import Product from '../models/Product'; // Sequelize model for products

// // Define the User interface to type the req.user object from JWT middleware
// interface User {
//     id: string; // User ID (for customers/admins)
//     UserId: string; // Alternative ID (for vendors, possibly same as id)
// }

// // Export the async function to handle GET /recommended-products
// export const getRecommendedProducts = async (req: Request, res: Response) => {
//     try {
//         // Check if req.user exists (set by auth middleware, e.g., JWT verification)
//         if (!req.user) {
//             // If no user data, return 401 Unauthorized with a message
//             res.status(401).json({ message: 'Unauthorized: No user data' });
//             return; // Exit the function
//         }

//         // Cast req.user to User interface for TypeScript safety
//         const user = req.user as User;
//         // Extract UserId, preferring UserId (for vendors) or falling back to id (for others)
//         const UserId = user.UserId || user.id;
//         // Log UserId for debugging (e.g., '883d9236-0b9e-4df9-b817-7510e82981d4')
//         console.log('UserId:', UserId);

//         // Validate UserId to ensure it’s not undefined or empty
//         if (!UserId) {
//             // Return 401 if UserId is invalid
//             res.status(401).json({ message: 'Unauthorized: Invalid user data' });
//             return;
//         }

//         // Fetch user interactions from database tables
//         // Query LikedProducts for the user, limited to 50 most recent
//         const likedProducts = await LikedProduct.findAll({
//             where: { UserId }, // Filter by UserId
//             include: [
//                 {
//                     model: Product, // Join with Products table
//                     attributes: ['id', 'CategoryId'], // Only fetch product ID and CategoryId
//                     required: false, // Left join to include liked products even if product is deleted
//                 },
//             ],
//             limit: 50, // Cap at 50 to avoid performance issues
//             order: [['likeTimestamp', 'DESC']], // Sort by most recent likes
//         });

//         // Query ViewedProducts, similar to liked products
//         const viewedProducts = await ViewedProduct.findAll({
//             where: { UserId },
//             include: [{ model: Product, attributes: ['id', 'CategoryId'], required: false }],
//             limit: 50,
//             order: [['viewTimestamp', 'DESC']], // Sort by most recent views
//         });

//         // Query SearchedProducts, only those with a valid ProductId
//         const searchedProducts = await SearchedProduct.findAll({
//             where: { UserId, ProductId: { [Op.ne]: null } }, // Exclude searches without ProductId
//             include: [{ model: Product, attributes: ['id', 'CategoryId'], required: false }],
//             limit: 50,
//             order: [['searchTimestamp', 'DESC']], // Sort by most recent searches
//         });

//         // Query ShoppingCart for cart items
//         const cartProducts = await ShoppingCart.findAll({
//             where: { UserId },
//             include: [{ model: Product, attributes: ['id', 'CategoryId'], required: false }],
//             limit: 50, // No order since cart items aren’t timestamp-prioritized
//         });

//         // Log interaction counts for debugging (e.g., Liked: 7, Viewed: 7, Searched: 8, Cart: 5)
//         console.log('Liked:', likedProducts.length);
//         console.log('Viewed:', viewedProducts.length);
//         console.log('Searched:', searchedProducts.length);
//         console.log('Cart:', cartProducts.length);

//         // Build user profile: Aggregate category preferences
//         // Initialize an object to store category scores (CategoryId -> score)
//         const categoryScores: { [key: string]: number } = {};

//         // Helper function to update category scores based on interactions
//         const updateCategoryScore = (product: any, weight: number) => {
//             // Extract CategoryId from the joined Product (product.Product.CategoryId)
//             const CategoryId = product?.Product?.CategoryId;
//             // If CategoryId exists, add the weight to its score
//             if (CategoryId) {
//                 // Increment score or initialize to 0 + weight
//                 categoryScores[CategoryId] = (categoryScores[CategoryId] || 0) + weight;
//             }
//         };

//         // Apply weights to interactions to reflect preference strength
//         // Likes (0.4): Strongest signal of preference
//         likedProducts.forEach((lp) => updateCategoryScore(lp, 0.4));
//         // Cart items (0.3): Strong purchase intent
//         cartProducts.forEach((cp) => updateCategoryScore(cp, 0.3));
//         // Views (0.2): Moderate interest
//         viewedProducts.forEach((vp) => updateCategoryScore(vp, 0.2));
//         // Searches (0.1): Weakest signal, as searches may be exploratory
//         searchedProducts.forEach((sp) => updateCategoryScore(sp, 0.1));

//         // Get top 5 categories by score
//         let topCategories = Object.entries(categoryScores) // Convert to [CategoryId, score] pairs
//             .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort descending by score
//             .slice(0, 5) // Take top 5
//             .map(([CategoryId]) => CategoryId); // Extract CategoryId

//         // Log category scores and top categories for debugging
//         // Example: Category Scores: { 'cat1': 3.5, 'cat2': 2.3, 'cat3': 0.7 }
//         console.log('Category Scores:', categoryScores);
//         console.log('Top Categories:', topCategories);

//         // Expand topCategories if fewer than 3 to ensure enough candidates
//         if (topCategories.length < 3) {
//             // Query popular categories by product count
//             const popularCategories = await Product.findAll({
//                 attributes: ['CategoryId'], // Only fetch CategoryId
//                 group: ['CategoryId'], // Group by CategoryId
//                 order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']], // Sort by product count
//                 limit: 5, // Take top 5
//             });
//             // Extract CategoryIds, excluding those already in topCategories
//             const additionalCategories = popularCategories
//                 .map((p) => p.CategoryId)
//                 .filter((id): id is string => !!id && !topCategories.includes(id));
//             // Combine and limit to 5
//             topCategories = [...topCategories, ...additionalCategories].slice(0, 5);
//             console.log('Expanded Categories:', topCategories);
//         }

//         // Collect interacted ProductIds to exclude from recommendations
//         const interactedProductIds = [
//             ...new Set([ // Use Set to remove duplicates
//                 ...likedProducts.map((lp) => lp.ProductId), // Liked product IDs
//                 ...viewedProducts.map((vp) => vp.ProductId), // Viewed product IDs
//                 ...searchedProducts.map((sp) => sp.ProductId).filter((id): id is string => !!id), // Searched product IDs
//                 ...cartProducts.map((cp) => cp.ProductId), // Cart product IDs
//             ]),
//         ];
//         // Log count of unique interacted products
//         console.log('Interacted Product IDs:', interactedProductIds.length);

//         // Count available products in top categories for debugging
//         const availableProducts = await Product.count({
//             where: { CategoryId: { [Op.in]: topCategories } }, // Count products in top categories
//         });
//         console.log('Available Products in Top Categories:', availableProducts);

//         // Fetch recommended products from top categories, excluding interacted products
//         let recommendedProducts = await Product.findAll({
//             where: {
//                 CategoryId: { [Op.in]: topCategories }, // Must be in top categories
//                 id: { [Op.notIn]: interactedProductIds }, // Must not be interacted with
//             },
//             attributes: [
//                 'id',
//                 'name',
//                 'description',
//                 'price',
//                 'CategoryId',
//                 'VendorId',
//                 'stock',
//                 'productImage',
//             ], // Fetch all fields needed for frontend
//             limit: 10, // Return up to 10 products
//             order: [['price', 'ASC']], // Sort by price ascending for diversity
//         });

//         // Log number of recommended products
//         console.log('Recommended Products:', recommendedProducts.length);

//         // If no products found and there are interacted products, retry without exclusion
//         if (recommendedProducts.length === 0 && interactedProductIds.length > 0) {
//             console.log('Retrying without exclusion');
//             recommendedProducts = await Product.findAll({
//                 where: { CategoryId: { [Op.in]: topCategories } }, // Only filter by category
//                 attributes: [
//                     'id',
//                     'name',
//                     'description',
//                     'price',
//                     'CategoryId',
//                     'VendorId',
//                     'stock',
//                     'productImage',
//                 ],
//                 limit: 10,
//                 order: [['price', 'ASC']],
//             });
//             console.log('Recommended Products (No Exclusion):', recommendedProducts.length);
//         }

//         // Final fallback: Return popular products if no recommendations found
//         if (recommendedProducts.length === 0) {
//             const popularProducts = await Product.findAll({
//                 limit: 10,
//                 order: [['stock', 'DESC']], // Sort by stock descending (proxy for popularity)
//                 attributes: [
//                     'id',
//                     'name',
//                     'description',
//                     'price',
//                     'CategoryId',
//                     'VendorId',
//                     'stock',
//                     'productImage',
//                 ],
//             });
//             console.log('Fallback Popular Products:', popularProducts.length);
//             // Return popular products
//             res.status(200).json({ recommendedProducts: popularProducts });
//             return;
//         }

//         // Return recommended products
//         res.status(200).json({ recommendedProducts });
//     } catch (error: any) {
//         // Handle any errors (e.g., database connection issues)
//         console.error('Error fetching recommended products:', error);
//         // Return 500 Internal Server Error with error message
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };