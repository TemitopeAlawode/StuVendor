"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesHandler = void 0;
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
const Message_1 = __importDefault(require("../models/Message"));
// ================================================
// @desc   Get chat history between the authenticated user and a specific receiver
// @route  GET  /messages
// @access Private
// ================================================
const getMessagesHandler = async (req, res) => {
    const user = req.user;
    const userId = user.UserId || user.id; // UserId for vendors, id for others
    const { receiverId } = req.query;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User not logged in.' });
        return;
    }
    try {
        // const messages = await Message.findAll({
        //     where: {
        //         [Op.or]: [
        //             { senderId: userId, receiverId },
        //             { senderId: receiverId, receiverId: userId },
        //         ],
        //     },
        //     order: [["createdAt", "ASC"]],
        // });
        // Fetch messages where user is sender or receiver
        const whereClause = {
            [sequelize_1.Op.or]: [{ senderId: userId }, { receiverId: userId }],
        };
        if (receiverId) {
            whereClause[sequelize_1.Op.or] = [
                { senderId: userId, receiverId },
                { senderId: receiverId, receiverId: userId },
            ];
        }
        const messages = await Message_1.default.findAll({
            where: whereClause,
            include: [
                { model: User_1.default, as: "Sender", attributes: ["id", "name", "email", "userType"] },
                { model: User_1.default, as: "Receiver", attributes: ["id", "name", "email", "userType"] },
            ],
            order: [["createdAt", "ASC"]],
        });
        res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};
exports.getMessagesHandler = getMessagesHandler;
// Initials - TAD
// September 2025
