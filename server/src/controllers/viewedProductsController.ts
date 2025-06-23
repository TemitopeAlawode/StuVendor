import { Request, Response } from "express";
import ViewedProduct from "../models/ViewedProduct";
import { Op } from "sequelize";

interface User {
    id: string
    UserId: string
}


// ================================================
// @desc  Save a viewed products to the database
// @route  POST  /viewed-products
// @access Private
// ================================================
export const createViewedProductHandler = async (req: Request, res: Response) => {
    try {
        const { ProductId, VendorId } = req.body;

        const user = req.user as User;
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
        const recentView = await ViewedProduct.findOne({
            where: {
                UserId,
                ProductId,
                viewTimestamp: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                }
            }
        });
        if (recentView) {
            res.status(200).json({ message: 'View already recorded recently' });
            return;
        }

        // Create new viewed product entry
        const viewedProduct = await ViewedProduct.create({
            UserId,
            ProductId,
            VendorId,
            viewTimestamp: new Date(),
        });

        res.status(201).json({ message: 'Product view successfully recorded.', viewedProduct });

    } catch (error) {
        console.error('Error saving viewed product:', error);
        res.status(500).json({ message: 'Failed to save viewed products.' });
    }
}