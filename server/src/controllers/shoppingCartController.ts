import { Request, Response } from "express";
import Product from "../models/Product";
import ShoppingCart from "../models/ShoppingCart";

interface User {
    id: string
    UserId: string
}


// ================================================
// @desc  Add product(s) to cart 
// @route  POST  /shopping-cart/add-to-cart
// @access Private
// ================================================
export const addToCartHandler = async (req: Request, res: Response) => {
    try {
        // const { ProductId, quantity } = req.body;
        const { ProductId } = req.body;
        const rawQuantity = req.body.quantity;
        const quantity = parseInt(rawQuantity, 10); // The 10 is the radix, or base — it tells TypeScript to treat the string as a base-10 (decimal) number.

        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        // Validate that the product exist and there's enough stock
        const product = await Product.findByPk(ProductId);
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        if (quantity > product.stock) {
            res.status(404).json({ message: `Only ${product.stock} products are available in stock..` });
            return;
        }

        // Check if product is already in cart, then update the quantity and totalPrice
        let cartProduct = await ShoppingCart.findOne({
            where: { UserId: userId, ProductId }
        });

        if (cartProduct) {
            // Update quantity and totalPrice
            const newQuantity = cartProduct.quantity + quantity;
            if (newQuantity > product.stock) {
                res.status(404).json({ message: `Only ${product.stock} products are available in stock..` });
                return;
            }
            cartProduct.quantity = newQuantity;
            //    cartProduct.quantity += quantity;
            //    Updating totalPrice
            cartProduct.totalPrice = newQuantity * product.price;
            await cartProduct.save();
        }
        else {
            // Create a new product in the cart
            cartProduct = await ShoppingCart.create({
                UserId: userId,
                ProductId,
                quantity,
                totalPrice: quantity * product.price,
            });
        }

        res.status(200).json({ message: 'Product added to cart successfully.', cartProduct });
    } catch (error: any) {
        console.error("Error adding product(s) to cart: ", error);
        res.status(500).json({ message: 'Failed to add product(s) to cart', error: error.message });
    }
}


// ================================================
// @desc   Get all products in the shopping cart
// @route  GET  /shopping-cart
// @access Private
// ================================================
export const getCartProductsHandler = async (req: Request, res: Response) => {
    try {
        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        // Get all products in cart
        const cartProducts = await ShoppingCart.findAll({
            where: { UserId: userId },
            include: [Product],
        });

        res.status(200).json({ message: 'Products in the shopping cart: ', cartProducts });
    } catch (error: any) {
        console.error("Error fetching product(s) in cart: ", error);
        res.status(500).json({ message: 'Failed to fetch product(s) in cart', error: error.message });
    }
}


// ================================================
// @desc   Update quantity of products in the shopping cart
// @route  PUT  /shopping-cart/:id
// @access Private
// ================================================
export const updateCartProductHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others

        // Converting quantity to a number/integer
        const numericQuantity = parseInt(quantity, 10)

        const cartProduct = await ShoppingCart.findOne({
            where: { id, UserId: userId },
            include: [Product]
        });
        if (!cartProduct) {
            res.status(401).json({ message: 'Product not found in cart.' });
            return;
        }

        cartProduct.quantity = numericQuantity;
        cartProduct.totalPrice = cartProduct.quantity * cartProduct.Product.price;

        await cartProduct.save();

        const updatedCartProduct = await ShoppingCart.findByPk(id,
            { include: [Product], }
        );

        res.status(200).json(updatedCartProduct);
    } catch (error: any) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ message: "Failed to update cart item", error: error.message });
    }

}

// ================================================
// @desc   Delete/Remove a product from cart
// @route  DELETE  /shopping-cart/:id
// @access Private
// ================================================
export const removeProductFromCartHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        // Check if the product exist in the cart
        const cartProduct = await ShoppingCart.findOne({ where: { id, UserId: userId } });
        if (!cartProduct) {
            res.status(401).json({ message: 'Product not found in cart.' });
            return;
        }

        // Delete Product / Remove product from cart
        await cartProduct.destroy();

        res.status(200).json({ message: "Product removed from cart successfully." });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Failed to remove/delete product from cart.' });
    }
};


// ================================================
// @desc   Get product count in cart
// @route  GET  /shopping-cart/count
// @access Private
// ================================================
export const getCartCountHandler = async (req: Request, res: Response) => {
    try {
        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others

        const cartProducts = await ShoppingCart.findAll({
            where: { UserId: userId },
        });
        // Get the count
        const count = cartProducts.length;
        res.status(200).json({ message: 'Cart count: ', count });
    } catch (error: any) {
        console.error("Error fetching cart count:", error.message);
        res.status(500).json({ message: "Failed to fetch cart count.", error: error.message });
    }
}