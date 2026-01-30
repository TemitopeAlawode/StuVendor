"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorOrderCountHandler = exports.withdrawFromVendorBalanceHandler = exports.getVendorBalanceHandler = exports.getVendorOrdersHandler = exports.verifyBankAccount = exports.getBanks = exports.getVendorByIdHandler = exports.getVendorsHandler = exports.getVendorHandler = exports.updateVendorHandler = exports.createVendorHandler = void 0;
// Import Vendor model
const console_1 = require("console");
const Vendor_1 = __importDefault(require("../models/Vendor"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderProducts_1 = __importDefault(require("../models/OrderProducts"));
const VendorPayout_1 = __importDefault(require("../models/VendorPayout"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
// import Flutterwave from 'flutterwave-node-v3';
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
// Flutterwave configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';
// ================================================
// @desc   Create Vendor Profile
// @route  POST  /vendors/create-vendor-profile
// @access Private (Vendors Only)
// ================================================
const createVendorHandler = async (req, res) => {
    try {
        // The user needs to be logged in to create a vendor profile or provide other important info/details for 
        // vendors so the user's id will be grabbed and attached to the profile that's being created.
        // The user's info is already stored here using the middleware(verifyToken.ts file)
        // Calling the interface for typechecking
        const user = req.user;
        console.log("Logged-in user:", req.user);
        // if (!user || !user.id) {
        //     res.status(401).json({ message: 'Unauthorized: User info not available.' });
        //     return; // Stops the function from going any further
        // }
        // Confirming the properties that's been inputted
        const { businessName, address, phoneNumber, description, bankCode, bankAccountNumber, bankAccountName } = req.body;
        // Vendor's profile picture
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : '';
        if (!businessName || !address || !phoneNumber || !bankCode || !bankAccountNumber || !bankAccountName || !profilePicture) {
            res.status(400).json({ message: 'All required fields must be provided.' });
            return;
        }
        // Validate Inputs
        if (!businessName) {
            res.status(400).json({ message: 'Business name is required to be inputted..' });
            return; // Stops the function from going any further
        }
        // Check if vendor already exist
        const existingVendor = await Vendor_1.default.findOne({ where: { UserId: user.id } });
        if (existingVendor) {
            res.status(409).json({ message: 'Vendor profile already exists.' });
            return; // Stops the function from going any further
        }
        // Validate phone number if provided
        if (phoneNumber) {
            // Check length is exactly 11
            if (phoneNumber.length !== 11) {
                console.log("Validation failed: Phone number must be exactly 11 characters.");
                res.status(400).json({ message: "Phone number must be exactly 11 characters long." });
                return;
            }
            // Check if phoneNumber contains only digits
            if (!/^\d+$/.test(phoneNumber)) {
                console.log("Validation failed: Phone number must contain only digits.");
                res.status(400).json({ message: "Phone number must contain only digits." });
                return;
            }
        }
        // Create the vendor in the database
        const vendor = await Vendor_1.default.create({
            UserId: user.id,
            businessName,
            address,
            phoneNumber,
            description,
            profilePicture,
            bankCode,
            bankAccountNumber,
            bankAccountName
        });
        // To update the user id relationship
        // vendor.setUser(user);
        res.status(201).json({ message: 'Vendor profile successfully created.', vendor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating vendor profile." });
    }
};
exports.createVendorHandler = createVendorHandler;
// ================================================
// @desc   Update Vendor Profile
// @route  PUT  /vendors/update-vendor-profile
// @access Private (Vendors Only)
// ================================================
const updateVendorHandler = async (req, res) => {
    try {
        const { businessName, address, phoneNumber, description, bankCode, bankAccountNumber, bankAccountName } = req.body;
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;
        // Validate Inputs
        // if (typeof businessName !== 'string') {
        //     return res.status(400).json({ message: 'Business name must be string' });
        // }
        // When a user logs in or sends a token, middleware verifies it and attaches the
        //  decoded user object to req.user.  req.user is being casted to the CustomVendor type to
        //  get the id, which will be used to find the matching vendor profile.
        // Validate phone number if provided
        if (phoneNumber) {
            // Check length is exactly 11
            if (phoneNumber.length !== 11) {
                console.log("Validation failed: Phone number must be exactly 11 characters.");
                res.status(400).json({ message: "Phone number must be exactly 11 characters long." });
                return;
            }
            // Check if phoneNumber contains only digits
            if (!/^\d+$/.test(phoneNumber)) {
                console.log("Validation failed: Phone number must contain only digits.");
                res.status(400).json({ message: "Phone number must contain only digits." });
                return;
            }
        }
        // Calling the interface for typechecking
        const user = req.user;
        // const vendor = await Vendor.findOne({ where: { UserId: user.id } });
        const vendor = await Vendor_1.default.findOne({ where: { id: user.id } });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor profile not found' });
            return; // Stops the function from going any further
        }
        // Update the details in the database
        // vendor.businessName = businessName;
        // vendor.address = address;
        // vendor.phoneNumber = phoneNumber;
        // vendor.description = description;
        // vendor.bankDetails = bankDetails;
        // await vendor.save();
        // Update the details in the database
        await vendor.update({
            businessName: businessName || vendor.businessName,
            address: address || vendor.address,
            phoneNumber: phoneNumber || vendor.phoneNumber,
            description: description || vendor.description,
            profilePicture: profilePicture || vendor.profilePicture,
            bankCode: bankCode || vendor.bankCode,
            bankAccountNumber: bankAccountNumber || vendor.bankAccountNumber,
            bankAccountName: bankAccountName || vendor.bankAccountName,
        });
        res.status(200).json({ message: 'Vendor profile updated successfully!', vendor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating vendor profile..' });
    }
};
exports.updateVendorHandler = updateVendorHandler;
// ================================================
// @desc   Get Vendor Profile
// @route  GET  /vendors/vendor-profile
// @access Private (Vendors Only)
// ================================================
const getVendorHandler = async (req, res) => {
    try {
        // Log req.user for debugging
        console.log("req.user in getVendorHandler:", req.user);
        // Calling the interface for typechecking
        // const user = req.user as CustomVendor;
        const user = req.user;
        // const vendor = await Vendor.findOne({ where: { UserId: user.id } });
        const vendor = await Vendor_1.default.findOne({ where: { id: user.id } });
        if (!vendor) {
            console.log("Vendor profile not found for UserId:", user.id);
            res.status(404).json({ message: 'Vendor profile not found' });
            return; // Stops the function from going any further
        }
        res.status(200).json(vendor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting vendor profile..' });
    }
};
exports.getVendorHandler = getVendorHandler;
// ================================================
// @desc   View all Vendors (only admins)
// @route  GET /vendors
// @access Private (only admins)
// ================================================
const getVendorsHandler = async (req, res) => {
    try {
        const vendors = await Vendor_1.default.findAll();
        res.status(200).json(vendors);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendors', error });
    }
};
exports.getVendorsHandler = getVendorsHandler;
// ================================================
// @desc   View/Get Vendor by ID (only admins)
// @route  GET /vendors/:id
// @access Private (only admins) / Public
// ================================================
const getVendorByIdHandler = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor_1.default.findByPk(vendorId);
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return; // Stops the function from going any further
        }
        res.status(200).json(vendor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendor by ID', error });
    }
};
exports.getVendorByIdHandler = getVendorByIdHandler;
// ================================================
// @desc   View/Get a list of banks
// @route  GET /vendors/banks
// @access Public
// ================================================
const getBanks = async (req, res) => {
    try {
        const response = await flw.Bank.country({ country: 'NG' });
        // res.status(200).json({ message: 'Bank List: ', response.data })
        if (response.status === 'success') {
            const sortedBanks = response.data.sort((a, b) => a.name.localeCompare(b.name));
            res.status(200).json(sortedBanks);
            // res.status(200).json(response.data);
        }
        else {
            console.error('Error: ', console_1.error);
        }
    }
    catch (error) {
        console.error('Failed to fetch banks:', error);
        res.status(500).json({ message: 'Failed to fetch bank list.' });
    }
};
exports.getBanks = getBanks;
// ================================================
// @desc   View/Get a list of banks
// @route  POST /vendors/verify-bank-account
// @access Public
// ================================================
const verifyBankAccount = async (req, res) => {
    try {
        const { bankAccountNumber, bankCode } = req.body;
        if (!bankAccountNumber || !bankCode) {
            res.status(400).json({ message: 'Account number and bank code are required.' });
            return;
        }
        const response = await flw.Misc.verify_Account({
            account_number: bankAccountNumber,
            account_bank: bankCode,
        });
        if (response.status === 'success') {
            res.status(200).json({ bankAccountName: response.data.account_name });
        }
        else {
            console.error('Error: ', console_1.error);
        }
    }
    catch (error) {
        console.error('Bank verification failed:', error);
        res.status(400).json({ message: 'Failed to verify bank account.', error });
    }
};
exports.verifyBankAccount = verifyBankAccount;
// ================================================
// @desc   View/Get  vendor orders
// @route  GET /vendors/orders
// @access Private
// ================================================
/*
Step 1: Fetch the vendor by UserId to get the vendorId.
Step 2: Query OrderProducts where VendorId matches the vendor’s ID to get all products sold by this vendor.
Step 3: Extract unique OrderIds from the OrderProducts results.
Step 4: Fetch Order records for those OrderIds.
Step 5: Combine the data to create a response where each order includes its associated products from OrderProducts.
Output: The response is a list of orders with their details (e.g., totalAmount, orderStatus) and the vendor’s products within each order (e.g., ProductId, quantity, price).
*/
const getVendorOrdersHandler = async (req, res) => {
    try {
        // Fetch vendor using their ID
        const user = req.user;
        const userId = user.UserId;
        const vendor = await Vendor_1.default.findOne({ where: { UserId: userId } });
        if (!vendor) {
            res.status(404).json({ message: "Vendor profile not found" });
            return;
        }
        const vendorId = vendor.id;
        // Fetch OrderProducts entries for this vendor
        const orderProducts = await OrderProducts_1.default.findAll({
            where: { VendorId: vendorId },
            attributes: ['OrderId', 'ProductId', 'quantity', 'price'], // Relevant fields
        });
        if (!orderProducts.length) {
            res.status(200).json([]);
            // res.status(200).json({ message: 'No orders found for this vendor.' });
            return;
        }
        // Get unique OrderIds from OrderProducts
        /*
        map()  | Pulls all `OrderId`s from the array orderProducts
        Set()  | Removes duplicates and only keeps unique values
        [... ] | Turns Set back into array
        */
        const orderIds = [...new Set(orderProducts.map((ord) => ord.OrderId))];
        // Fetch Order details/records for these OrderIds
        const orders = await Order_1.default.findAll({
            where: { id: orderIds },
            order: [["orderDate", "DESC"]], // Sort by orderDate in descending order
        });
        // Combine OrderProducts with Orders for response
        /*
        Loops through all orders.
        For each order, finds its matching products.
        ...order.toJSON() - This spreads all the original order data into a plain object
        Combines them into a new object with the order info and its products.
        Useful when returning vendor orders with their product details in one response.
        */
        const vendorOrders = orders.map((order) => ({
            ...order.toJSON(),
            Products: orderProducts
                .filter((op) => op.OrderId === order.id)
                .map((op) => ({
                ProductId: op.ProductId,
                quantity: op.quantity,
                price: op.price,
            })),
        }));
        console.log('Vendor Orders: ', vendorOrders);
        res.status(200).json(vendorOrders);
    }
    catch (error) {
        console.error("Error fetching vendor orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};
exports.getVendorOrdersHandler = getVendorOrdersHandler;
// ================================================
// @desc   Get vendor balance
// @route  GET /vendors/balance
// @access Private  (Vendor only)
// ================================================
const getVendorBalanceHandler = async (req, res) => {
    try {
        // Fetch vendor using their ID
        const user = req.user;
        const userId = user.UserId;
        const vendor = await Vendor_1.default.findOne({ where: { UserId: userId } });
        if (!vendor) {
            res.status(404).json({ message: "Vendor profile not found" });
            return;
        }
        const vendorId = vendor.id;
        // Fetch completed order_split(s)
        const orderSplits = await VendorPayout_1.default.findAll({
            where: {
                VendorId: vendorId,
                status: 'completed',
                type: 'order_split'
            },
            attributes: ['amount']
        });
        // Fetch completed withdrawals
        const withdrawals = await VendorPayout_1.default.findAll({
            where: {
                VendorId: vendorId,
                status: 'completed',
                type: 'withdrawal'
            },
            attributes: ['amount']
        });
        // Calculate total order splits and withdrawals
        const totalOrderSplits = orderSplits.reduce((sum, payout) => sum + payout.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum, payout) => sum + payout.amount, 0);
        // Calculate available balance
        const availableBalance = totalOrderSplits - totalWithdrawals;
        // Return balance
        res.status(200).json({ balance: availableBalance.toFixed(2) });
    }
    catch (error) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch balance' });
    }
};
exports.getVendorBalanceHandler = getVendorBalanceHandler;
// Helper function to calculate vendor balance
async function getVendorBalance(vendorId) {
    const orderSplits = await VendorPayout_1.default.findAll({
        where: { VendorId: vendorId, status: 'completed', type: 'order_split' },
        attributes: ['amount'],
    });
    const withdrawals = await VendorPayout_1.default.findAll({
        where: { VendorId: vendorId, status: 'completed', type: 'withdrawal' },
        attributes: ['amount'],
    });
    const totalOrderSplits = orderSplits.reduce((sum, payout) => sum + payout.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, payout) => sum + payout.amount, 0);
    return totalOrderSplits - totalWithdrawals;
}
// ================================================
// @desc   Initiate vendor withdrawal
// @route  POST /vendors/withdraw
// @access Private (Vendor only)
// ================================================
const withdrawFromVendorBalanceHandler = async (req, res) => {
    try {
        // Fetch vendor using their ID
        const user = req.user;
        const userId = user.UserId;
        const { amount } = req.body;
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            res.status(400).json({ message: "Invalid withdrawal amount" });
            return;
        }
        // Fetch vendor
        const vendor = await Vendor_1.default.findOne({ where: { UserId: userId } });
        if (!vendor) {
            res.status(404).json({ message: "Vendor profile not found" });
            return;
        }
        if (!vendor.bankCode || !vendor.bankAccountNumber) {
            res.status(400).json({ message: "Bank details not configured" });
            return;
        }
        const vendorId = vendor.id;
        // Check balance
        const availableBalance = await getVendorBalance(vendorId);
        if (amount > availableBalance) {
            res.status(400).json({ message: "Insufficient balance" });
            return;
        }
        // Create pending payout record
        const transferReference = `WD-${(0, uuid_1.v4)()}`;
        const payout = await VendorPayout_1.default.create({
            VendorId: vendor.id, // it will always exist.
            amount,
            status: 'pending',
            type: 'withdrawal',
            transferReference,
        });
        // Initiate Flutterwave transfer
        try {
            const transferResponse = await axios_1.default.post(`${FLUTTERWAVE_API_URL}/transfers`, {
                account_bank: vendor.bankCode,
                account_number: vendor.bankAccountNumber,
                amount,
                currency: 'NGN',
                reference: transferReference,
                narration: `Vendor withdrawal for ${vendor.id}`,
            }, {
                headers: {
                    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                },
            });
            if (transferResponse.data.status === 'success') {
                await payout.update({ status: 'completed', transactionId: transferResponse.data.data.id });
                res.status(200).json({
                    status: 'success',
                    message: 'Withdrawal successful',
                    balance: (availableBalance - amount).toFixed(2),
                });
            }
            else {
                await payout.update({ status: 'failed' });
                res.status(400).json({ message: 'Withdrawal failed at payment provider' });
            }
        }
        catch (transferError) {
            await payout.update({ status: 'failed' });
            console.error('Transfer error:', transferError.response?.data || transferError);
            res.status(500).json({ message: 'Withdrawal failed', error: transferError.message });
        }
    }
    catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process withdrawal', error: error.message });
    }
};
exports.withdrawFromVendorBalanceHandler = withdrawFromVendorBalanceHandler;
// ================================================
// @desc   Get count of pending orders for a vendor
// @route  GET /vendors/orders/count
// @access Private (Vendor)
// ================================================
const getVendorOrderCountHandler = async (req, res) => {
    try {
        const user = req.user;
        const userId = user.UserId || user.id; // UserId for vendors, id for others
        // Fetch vendor
        const vendor = await Vendor_1.default.findOne({ where: { UserId: userId } });
        if (!vendor) {
            res.status(404).json({ message: "Vendor profile not found" });
            return;
        }
        const vendorId = vendor.id;
        // Find distinct Order IDs where OrderProducts has the vendorId and Order is pending
        const orderCount = await OrderProducts_1.default.count({
            distinct: true,
            col: "OrderId",
            include: [
                {
                    model: Order_1.default,
                    as: "Order",
                    where: { orderStatus: "pending" },
                    attributes: [],
                },
            ],
            where: { VendorId: vendorId },
        });
        res.status(200).json({ count: orderCount });
    }
    catch (error) {
        console.error("Failed to fetch vendor order count:", error.message || error);
        res.status(500).json({ message: "Failed to fetch order count." });
    }
};
exports.getVendorOrderCountHandler = getVendorOrderCountHandler;
