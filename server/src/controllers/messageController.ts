// Importing req and res from express
import { Request, Response } from "express";
import User from "../models/User";
import { Op } from "sequelize";
import Message from "../models/Message";

interface User {
    id: string
    UserId: string
}


// ================================================
// @desc   Get chat history between the authenticated user and a specific receiver
// @route  GET  /messages
// @access Private
// ================================================
export const getMessagesHandler = async (req: Request, res: Response) => {
    const user = req.user as User;
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
                const whereClause: any = {
                    [Op.or]: [{ senderId: userId }, { receiverId: userId }],
                };
        
                if (receiverId) {
                    whereClause[Op.or] = [
                        { senderId: userId, receiverId },
                        { senderId: receiverId, receiverId: userId },
                    ];
                }
        
                const messages = await Message.findAll({
                    where: whereClause,
                    include: [
                                    { model: User, as: "Sender", attributes: ["id", "name", "email", "userType"] },
                                    { model: User, as: "Receiver", attributes: ["id", "name", "email", "userType"] },
                                ],
                    order: [["createdAt", "ASC"]],
                });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}