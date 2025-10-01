import { Request, Response } from "express";
import Vendor from "../models/Vendor";
import VendorPayout from "../models/VendorPayout";

const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
);

// Define interfaces for type safety
interface CartProduct {
    VendorId: string;
    price: number;
    quantity: number;
}

interface VendorShares {
    [key: string]: number;
}


interface VendorPayoutAttributes {
    VendorId: string;
    transactionId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    type: 'order_split' | 'withdrawal';
}


// ================================================
// @desc Transaction Verification
// @route POST /payments/verify
// @access Private 
// ================================================
export const verifyPaymentHandler = async (req: Request, res: Response) => {
    const { tx_ref, transaction_id } = req.body;
    try {
        const response = await flw.Transaction.verify({ id: transaction_id });
        if (response.status === 'success' && response.data.tx_ref === tx_ref) {
            res.status(200).json({ status: 'success', data: response.data });
        }
        else {
            res.status(400).json({ message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
}


// ================================================
// @desc Payment splitting among vendors
// @route POST /payments/split
// @access Private 
// ================================================
export const splitPaymentHandler = async (req: Request, res: Response) => {
    const { transactionId, cartProducts, totalAmount, deliveryFee } = req.body;

    if (!transactionId || !cartProducts || !totalAmount || !deliveryFee) {
        res.status(400).json({ message: 'Missing required fields.' });
        return;
    }


    try {

        // Grouping products by vendor and calculating how much each vendor should receive
        // reduce(...) is used to accumulate values; in this case, a vendorId: totalShare mapping
        // acc is the accumulator — it starts as an empty object {}.
        const vendorShares: VendorShares = (cartProducts as CartProduct[]).reduce((acc: VendorShares, product: CartProduct) => {
            // For each product in cartProducts:
            // Get the vendorId (who owns the product).
            const vendorId = product.VendorId;
            // Calculate the share = price × quantity.
            const share = product.price * product.quantity;
            // Add the share to the existing total in acc[vendorId].
            // If it doesn’t exist yet, start from `0
            acc[vendorId] = (acc[vendorId] || 0) + share;
            return acc;
        }, {});

        // Fetch Vendor details
        // Extracts all the keys (i.e., the vendor IDs) from the vendorShares object into an array
        const vendorIds = Object.keys(vendorShares);
        const vendors = await Vendor.findAll({ where: { id: vendorIds } });

        // Calculate fees
        const flutterwaveFee = totalAmount * 0.014; //1.4% fee
        // const platformCommission = 
        const amountToSplit = totalAmount - flutterwaveFee - deliveryFee;

        // Calculate equal delivery fee per vendor
        const vendorCount = vendors.length;
        const deliveryFeePerVendor = vendorCount > 0 ? deliveryFee / vendorCount : 0;


        // Calculate and store splits
        /* Object.values(vendorShares) returns all share values, e.g., [3000, 2000].
           .reduce(...) adds them together → 3000 + 2000 = 5000.
           This helps us calculate each vendor's percentage share later. */
        // Calculate total share from all vendors
        const totalVendorShare: number = Object.values(vendorShares).reduce((sum: number, share: number) => sum + share, 0);
        // Build payout records for each vendor
        // Loops through each vendor fetched earlier to calculate and prepare their payout
        const payoutRecords: VendorPayoutAttributes[] = vendors.map((vendor: any) => {
            //  Calculate the vendor's exact share of amountToSplit.
            // vendorShares[vendor.id] is how much this vendor sold.
            const vendorShare = (vendorShares[vendor.id] / totalVendorShare) * amountToSplit;
            // Ensures the payout amount is a whole number (no decimals).
            const amount = Math.floor(vendorShare + deliveryFeePerVendor);

            console.log('amountToSplit: ', amountToSplit);
            console.log('totalVendorShare: ', totalVendorShare);
            console.log('vendorShares[vendor.id]: ', vendorShares[vendor.id]);
            console.log(`Vendor ${vendor.id} Share:`, {
                vendorShare,
                deliveryFeePerVendor,
                finalAmount: amount,
            });
            // Return the payout record for the vendor
            return {
                VendorId: vendor.id,                 // ID of the vendor
                transactionId,                       // The transaction this split is tied to
                amount,                              // How much this vendor is to be paid
                status: 'completed',                 // Payment status
                type: 'order_split',                 // Reason/type of this transaction
            };
        });
        // Save payout record
        await VendorPayout.bulkCreate(payoutRecords);

        // Log payout records
        console.log("Payout Records:", payoutRecords);

        res.status(200).json({ message: 'Payouts successfully created', payoutRecords });

    } catch (error: any) {
        console.error('Error in splitPaymentHandler:', error);
        res.status(500).json({ message: 'Failed to process payouts', error: error.message });
    }

}
