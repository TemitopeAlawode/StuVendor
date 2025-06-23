// Import Vendor model
import { error } from 'console';
import Vendor from '../models/Vendor';
// Importing req and res from express
import { Request, Response } from 'express';

// import Flutterwave from 'flutterwave-node-v3';
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(
	process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
);

interface CustomVendor {
    id: string
    businessName: string
    address?: string
    phoneNumber?: string
    description?: string
    profilePicture: string;
    bankCode: string
    bankAccountNumber: string
    bankAccountName: string
}


// ================================================
// @desc   Create Vendor Profile
// @route  POST  /vendors/create-vendor-profile
// @access Private (Vendors Only)
// ================================================
export const createVendorHandler = async (req: Request, res: Response) => {
    try {
        // The user needs to be logged in to create a vendor profile or provide other important info/details for 
        // vendors so the user's id will be grabbed and attached to the profile that's being created.
        // The user's info is already stored here using the middleware(verifyToken.ts file)

        // Calling the interface for typechecking
        const user = req.user as CustomVendor;
        console.log("Logged-in user:", req.user);

        // if (!user || !user.id) {
        //     res.status(401).json({ message: 'Unauthorized: User info not available.' });
        //     return; // Stops the function from going any further
        // }

        // Confirming the properties that's been inputted
        const { businessName, address, phoneNumber, description, bankCode, bankAccountNumber, bankAccountName }: CustomVendor = req.body;

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
        const existingVendor = await Vendor.findOne({ where: { UserId: user.id } });
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
        const vendor = await Vendor.create({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating vendor profile." });
    }
}

// ================================================
// @desc   Update Vendor Profile
// @route  PUT  /vendors/update-vendor-profile
// @access Private (Vendors Only)
// ================================================
export const updateVendorHandler = async (req: Request, res: Response) => {
    try {
        const { businessName, address, phoneNumber, description, bankCode, bankAccountNumber, bankAccountName }: CustomVendor = req.body;

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
        const user = req.user as CustomVendor;

        // const vendor = await Vendor.findOne({ where: { UserId: user.id } });
        const vendor = await Vendor.findOne({ where: { id: user.id } });
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating vendor profile..' });
    }
}

// ================================================
// @desc   Get Vendor Profile
// @route  GET  /vendors/vendor-profile
// @access Private (Vendors Only)
// ================================================
export const getVendorHandler = async (req: Request, res: Response) => {
    try {
        // Log req.user for debugging
        console.log("req.user in getVendorHandler:", req.user);

        // Calling the interface for typechecking
        // const user = req.user as CustomVendor;
        const user = req.user as InstanceType<typeof Vendor>;

        // const vendor = await Vendor.findOne({ where: { UserId: user.id } });
        const vendor = await Vendor.findOne({ where: { id: user.id } });
        if (!vendor) {
            console.log("Vendor profile not found for UserId:", user.id);
            res.status(404).json({ message: 'Vendor profile not found' });
            return; // Stops the function from going any further
        }

        res.status(200).json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting vendor profile..' })
    }
}



// ================================================
// @desc   View all Vendors (only admins)
// @route  GET /vendors
// @access Private (only admins)
// ================================================
export const getVendorsHandler = async (req: Request, res: Response) => {
    try {
        const vendors = await Vendor.findAll();
        res.status(200).json(vendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendors', error });
    }
}

// ================================================
// @desc   View/Get Vendor by ID (only admins)
// @route  GET /vendors/:id
// @access Private (only admins) / Public
// ================================================
export const getVendorByIdHandler = async (req: Request, res: Response) => {
    try {
        const vendorId = req.params.id;

        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return; // Stops the function from going any further
        }

        res.status(200).json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendor by ID', error });
    }
}


// ================================================
// @desc   View/Get a list of banks
// @route  GET /vendors/banks
// @access Public
// ================================================
export const getBanks = async (req: Request, res: Response) => {
try {
    const response = await flw.Bank.country({ country: 'NG' });
    // res.status(200).json({ message: 'Bank List: ', response.data })
    if (response.status === 'success') {
    res.status(200).json(response.data);
    }
    else{
        console.error('Error: ', error);  
    }
} catch (error) {
    console.error('Failed to fetch banks:', error);
    res.status(500).json({ message: 'Failed to fetch bank list.' });
}
}


// ================================================
// @desc   View/Get a list of banks
// @route  POST /vendors/verify-bank-account
// @access Public
// ================================================
export const verifyBankAccount = async (req: Request, res: Response) => {
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
      console.error('Error: ', error);  
    }
  } catch (error) {
    console.error('Bank verification failed:', error);
    res.status(400).json({ message: 'Failed to verify bank account.', error });
  }
};

