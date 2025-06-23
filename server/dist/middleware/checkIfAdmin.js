"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing User model
const User_1 = __importDefault(require("../models/User"));
const checkIfAdmin = async (req, res, next) => {
    try {
        const user = await User_1.default.findByPk(req.user.id);
        if (!user || user.userType !== 'admin') {
            return res.status(403).json({
                message: 'Access denied, admins only..'
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error checking admin privileges.'
        });
    }
};
module.exports = checkIfAdmin;
