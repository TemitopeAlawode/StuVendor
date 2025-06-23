"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing User model
const User_1 = __importDefault(require("../models/User"));
const checkIfVendor = async (req, res, next) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user || user.userType !== 'vendor') {
            return res.status(403).json({
                message: 'Access denied, vendors only..'
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error checking vendor privileges.'
        });
    }
};
module.exports = checkIfVendor;
