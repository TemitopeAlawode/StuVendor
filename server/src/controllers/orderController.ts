import { Request, Response } from "express";
import Order from "../models/Order";
import sequelize from "../db";
import OrderProducts from "../models/OrderProducts";

interface User {
    id: string
    UserId: string
}

interface CartProduct {
    VendorId: string;
    ProductId: string;
    price: number;
    quantity: number;
}

// ================================================
// @desc  Save orders to the table after successful payment
// @route  POST  /orders
// @access Private
// ================================================
export const createOrderHandler = async (req: Request, res: Response) => {
    try {
        const { totalAmount, shippingAddress, transactionId, customerName, customerEmail, customerPhone, cartProducts } = req.body;

        const user = req.user as User;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User not logged in.' });
            return;
        }

        if (!shippingAddress || !totalAmount || !transactionId || !customerName || !customerEmail || !customerPhone || !cartProducts) {
            res.status(400).json({ message: 'Missing required fields.' });
            return;
        }
        

        // Start a transaction
        // In database transactions, atomicity means that a series of operations are treated as a 
        // single, indivisible unit of work. Either all operations within the transaction are successfully completed, or none of them are. 

        const order = await sequelize.transaction(async (t) => {

            // Create a new entry in the Order table
            const newOrder = await Order.create({
                UserId: userId,
                totalAmount,
                shippingAddress,
                transactionId,
                orderStatus: "pending",
                orderDate: new Date(),
                customerName,
                customerEmail,
                customerPhone,
            },
                { transaction: t }
            );

            // Create OrderProducts records
            const orderProductsRecords = cartProducts.map((product: CartProduct) => ({
                UserId: userId,
                ProductId: product.ProductId,
                VendorId: product.VendorId,
                OrderId: newOrder.id,
                quantity: product.quantity,
                price: product.price
            }));

            await OrderProducts.bulkCreate(orderProductsRecords, { transaction: t });

            return newOrder;

        });
        res.status(201).json({ message: 'Order created successfully.', order });
    } catch (error) {
        console.error('Order creation error: ', error);
        res.status(500).json({ message: 'Failed to create order.' })
    }
};






