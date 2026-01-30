"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderHandler = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const db_1 = __importDefault(require("../db"));
const OrderProducts_1 = __importDefault(require("../models/OrderProducts"));
// ================================================
// @desc  Save orders to the table after successful payment
// @route  POST  /orders
// @access Private
// ================================================
const createOrderHandler = async (req, res) => {
    try {
        const { totalAmount, shippingAddress, transactionId, customerName, customerEmail, customerPhone, cartProducts } = req.body;
        const user = req.user;
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
        const order = await db_1.default.transaction(async (t) => {
            // Create a new entry in the Order table
            const newOrder = await Order_1.default.create({
                UserId: userId,
                totalAmount,
                shippingAddress,
                transactionId,
                orderStatus: "pending",
                orderDate: new Date(),
                customerName,
                customerEmail,
                customerPhone,
            }, { transaction: t });
            // Create OrderProducts records
            const orderProductsRecords = cartProducts.map((product) => ({
                UserId: userId,
                ProductId: product.ProductId,
                VendorId: product.VendorId,
                OrderId: newOrder.id,
                quantity: product.quantity,
                price: product.price
            }));
            await OrderProducts_1.default.bulkCreate(orderProductsRecords, { transaction: t });
            return newOrder;
        });
        res.status(201).json({ message: 'Order created successfully.', order });
    }
    catch (error) {
        console.error('Order creation error: ', error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
};
exports.createOrderHandler = createOrderHandler;
