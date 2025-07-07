import { Request, Response } from 'express';
import { Vendor, VendorPayout } from '../models';
import { User } from '../models/User';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Flutterwave configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

// Helper function to calculate vendor balance
async function getVendorBalance(vendorId: string): Promise<number> {
    const orderSplits = await VendorPayout.findAll({
        where: { VendorId: vendorId, status: 'completed', type: 'order_split' },
        attributes: ['amount'],
    });
    const withdrawals = await VendorPayout.findAll({
        where: { VendorId: vendorId, status: 'completed', type: 'withdrawal' },
        attributes: ['amount'],
    });
    const totalOrderSplits = orderSplits.reduce((sum, payout) => sum + payout.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, payout) => sum + payout.amount, 0);
    return totalOrderSplits - totalWithdrawals;
}

// @desc   Get vendor balance
// @route  GET /vendors/balance
// @access Private (Vendor only)
export const getVendorBalanceHandler = async (req: Request, res: Response) => {
    try {
        const user = req.user as User;
        const userId = user.UserId;
        const vendor = await Vendor.findOne({ where: { UserId: userId } });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }
        const availableBalance = await getVendorBalance(vendor.id);
        res.status(200).json({
            status: 'success',
            balance: availableBalance.toFixed(2),
        });
    } catch (error: any) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch balance', error: error.message });
    }
};

// @desc   Initiate vendor withdrawal
// @route  POST /vendors/withdraw
// @access Private (Vendor only)
export const withdrawVendorBalanceHandler = async (req: Request, res: Response) => {
    try {
        const user = req.user as User;
        const userId = user.UserId;
        const { amount } = req.body;

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        // Fetch vendor
        const vendor = await Vendor.findOne({ where: { UserId: userId } });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }
        if (!vendor.bankCode || !vendor.accountNumber) {
            return res.status(400).json({ message: "Bank details not configured" });
        }

        // Check balance
        const availableBalance = await getVendorBalance(vendor.id);
        if (amount > availableBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Create pending payout record
        const transferReference = `WD-${uuidv4()}`;
        const payout = await VendorPayout.create({
            id: uuidv4(),
            VendorId: vendor.id,
            amount,
            status: 'pending',
            type: 'withdrawal',
            transferReference,
        });

        // Initiate Flutterwave transfer
        try {
            const transferResponse = await axios.post(
                `${FLUTTERWAVE_API_URL}/transfers`,
                {
                    account_bank: vendor.bankCode,
                    account_number: vendor.accountNumber,
                    amount,
                    currency: 'NGN',
                    reference: transferReference,
                    narration: `Vendor withdrawal for ${vendor.id}`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                    },
                }
            );

            if (transferResponse.data.status === 'success') {
                await payout.update({ status: 'completed', transactionId: transferResponse.data.data.id });
                res.status(200).json({
                    status: 'success',
                    message: 'Withdrawal successful',
                    balance: (availableBalance - amount).toFixed(2),
                });
            } else {
                await payout.update({ status: 'failed' });
                res.status(400).json({ message: 'Withdrawal failed at payment provider' });
            }
        } catch (transferError: any) {
            await payout.update({ status: 'failed' });
            console.error('Transfer error:', transferError.response?.data || transferError);
            res.status(500).json({ message: 'Withdrawal failed', error: transferError.message });
        }
    } catch (error: any) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to process withdrawal', error: error.message });
    }
};













import { Request, Response } from "express";
import { Order, OrderProduct, Product } from "../models"; // Sequelize models
import { authMiddleware } from "../middleware/auth"; // Assumes you have auth middleware

// @desc   Get count of pending orders for a vendor
// @route  GET /vendors/orders/count
// @access Private (Vendor)
export const getVendorOrderCount = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.id; // From authMiddleware (decoded JWT)
        if (!vendorId) {
            return res.status(401).json({ message: "Unauthorized: No vendor ID found." });
        }

        // Count pending orders for the vendor
        const orderCount = await Order.count({
            include: [
                {
                    model: OrderProduct,
                    include: [
                        {
                            model: Product,
                            where: { VendorId: vendorId },
                        },
                    ],
                },
            ],
            where: { orderStatus: "pending" },
        });

        res.status(200).json({ count: orderCount });
    } catch (error: any) {
        console.error("Failed to fetch vendor order count:", error.message || error);
        res.status(500).json({ message: "Failed to fetch order count." });
    }
};

// Add to routes
router.get("/vendors/orders/count", authMiddleware, getVendorOrderCount);