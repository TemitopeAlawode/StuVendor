"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorByIdHandler = exports.getVendorsHandler = exports.getVendorHandler = exports.updateVendorHandler = exports.createVendorHandler = void 0;
// Import Vendor model
const Vendor_1 = __importDefault(require("../models/Vendor"));
// ================================================
// @desc   Create Vendor Profile
// @route  POST  /vendors/create-vendor-profile
// @access Private (Vendors Only)
// ================================================
const createVendorHandler = async (req, res) => {
    try {
        // The user needs to be logged in to create a vendor profile or provide other important info/details for 
        // vendors so the user's id will be grabbed and attached to the profile that's being created.
        // The user's info is already stored here using the middleware(verifyToken.js file)
        // Calling the interface for typechecking
        const user = req.user;
        console.log("Logged-in user:", req.user);
        if (!user || !user.id) {
            res.status(401).json({ message: 'Unauthorized: User info not available.' });
            return; // Stops the function from going any further
        }
        // Confirming the properties that's been inputted
        const { businessName, address, phoneNumber, description, bankDetails } = req.body;
        // Vendor's profile picture
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : '';
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
        // Validate phone number (basic check)
        const phoneRegex = /^\+?[\d\s-]{10,}$/; // Example: allows +1234567890 or 1234567890
        if (phoneNumber && !phoneRegex.test(phoneNumber)) {
            console.log("Validation failed: Invalid phone number format.");
            res.status(400).json({ message: 'Invalid phone number format.' });
            return;
        }
        // Create the vendor in the database
        const vendor = await Vendor_1.default.create({
            UserId: user.id,
            businessName,
            address,
            phoneNumber,
            description,
            bankDetails,
            profilePicture
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
        const { businessName, address, phoneNumber, description, bankDetails } = req.body;
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;
        // Validate Inputs
        // if (typeof businessName !== 'string') {
        //     return res.status(400).json({ message: 'Business name must be string' });
        // }
        // When a user logs in or sends a token, middleware verifies it and attaches the
        //  decoded user object to req.user.  req.user is being casted to the CustomVendor type to
        //  get the id, which will be used to find the matching vendor profile.
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
            bankDetails: bankDetails || vendor.bankDetails,
            profilePicture: profilePicture || vendor.profilePicture
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
