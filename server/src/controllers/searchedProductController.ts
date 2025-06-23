import { Request, Response } from "express";
import SearchedProduct from "../models/SearchedProduct";

interface User {
    id: string
    UserId: string
}

// ================================================
// @desc  Save a search query and products to the database
// @route  POST  /searched-products
// @access Private
// ================================================
export const saveSearchedProductHandler = async (req: Request, res: Response) => {
    try {
        const { searchQuery, ProductId, VendorId } = req.body;
        const user = req.user as User;
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
        const searchedProduct = await SearchedProduct.create({
            UserId: userId,
            searchQuery,
            ProductId,
            VendorId,
            searchTimestamp: new Date()
        });

        res.status(201).json({ message: 'Search saved successfully.', searchedProduct });
    } catch (error) {
        console.error('Error saving search query/product: ', error);
        res.status(500).json({ message: 'Failed to save search query/product.' })
    }
};