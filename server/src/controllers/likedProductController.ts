import { Request, Response } from "express";
import Product from "../models/Product";
import LikedProduct from "../models/LikedProduct";

// interface LikedProductAttributes {
//     UserId: string;
//     ProductId: string;
//     VendorId: string;
//     likeTimestamp: Date;
// }

interface User {
    id: string
    userType?: 'customer' | 'vendor' | 'admin';
    UserId: string
}

// ================================================
// @desc   Like a product
// @route  POST  /liked-products
// @access Private
// ================================================
export const likeProductHandler = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body;
        // Getting user id from JWT middleware/token

        // const userId = req.user?.id;
        const user = req.user as User;
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
        const product = await Product.findByPk(productId);
        if (!product) {
            res.status(401).json({ message: 'Product not found.' });
            return;
        }

        // Check if the product is already liked
        const existingLike = await LikedProduct.findOne({ where: { UserId: userId, ProductId: productId } });
        if (existingLike) {
            res.status(401).json({ message: 'Product already liked.' });
            return;
        }

        if (!product.VendorId) {
            res.status(401).json({ message: 'Product already liked.' });
            return;
        }

        // Create Like 
        const likedProduct = await LikedProduct.create({
            UserId: userId,
            ProductId: productId,
            VendorId: product.VendorId,
            likeTimestamp: new Date(),
        });

        res.status(201).json({ message: 'Product liked successfully.', likedProduct })
    } catch (error) {
        console.error('Error liking product: ', error);
        res.status(500).json({ message: 'Failed to like product.' })
    }
}


// ================================================
// @desc   Unlike a product
// @route  DELETE  /liked-products/:productId
// @access Private
// ================================================
export const unlikeProductHandler = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        // Check if the like exist
        const likedProduct = await LikedProduct.findOne({ where: { UserId: userId, ProductId: productId } });
        if (!likedProduct) {
            res.status(401).json({ message: 'Liked product not found.' });
            return;
        }

        // Delete Liked Product / Remove like
        await likedProduct.destroy();

        res.status(200).json({ message: "Product unliked successfully." });
    } catch (error) {
        console.error('Error unliking product:', error);
        res.status(500).json({ message: 'Failed to unlike product.' });
    }
};


// ================================================
// @desc   Get users liked products
// @route  GET  /liked-products
// @access Private
// ================================================
export const getLikedProductsHandler = async (req: Request, res: Response) => {
    try {
        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        //  Get all liked products
        const likedProducts = await LikedProduct.findAll({ 
            where: { UserId: userId },
            include: [Product],
         });

        res.status(200).json({ message: 'Liked Products: ', likedProducts });
    } catch (error) {
        console.error("Error fetching liked products:", error);
        res.status(500).json({ message: "Failed to fetch liked products." });
    }
};