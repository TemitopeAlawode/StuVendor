"use strict";
// import { Server } from "socket.io";
// import { verify } from "jsonwebtoken";
// import Message from "../models/Message";
// // import config from '../config/config';
// const config = require('../config/config');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const setupSocket = (httpServer: any) => {
//     /* --------> 
//     Socket.IO Server Setup
//     Creates a Socket.IO server with CORS configuration to allow connections from the frontend.
//     */
//     const io = new Server(httpServer, {
//         cors: {
//             origin: process.env.VITE_FRONTEND_URL,
//             methods: ["GET", "POST"],
//             credentials: true
//         }
//     });
//     /* --------> 
//     JWT Authentication Middleware
//     The middleware intercepts every connection attempt and:
//     Extracts the JWT token from the client's handshake
//     Verifies the token using the JWT secret
//     Joins the user to a room based on their user ID (for targeted messaging)
//     Rejects connections with invalid/missing tokens
//     */
//     // The handshake is the initial negotiation process that happens when a client tries to connect to the Socket.IO server. It's like a "hello, here are my credentials" moment.
//     io.use((socket, next) => {
//         const token = socket.handshake.auth.token;
//         if (!token) {
//             next(new Error("Authentication error: No token provided."));
//             return;
//         }
//         try {
//             // Verify the token
//             const decoded = verify(token, config.jwtSecret) as { id: string };
//             // Store user ID directly using the built-in data property
//             socket.data.userId = decoded.id
//             // Join user-specific room
//             socket.join(decoded.id);
//             next();
//         } catch (error) {
//             next(new Error("Authentication error: Invalid token."));
//         }
//     });
//     /* -------->
//     Main Event Handlers
//     Connection Handler: When a user connects, it logs their connection and sets up message event listeners.
//     */
//     io.on("connection", (socket) => {
//         const userId = socket.data.userId;
//         console.log(`User connected: ${userId}`);
//         /*
//         Send Message (sendMessage):
//         Validates that both receiverId and content are provided
//         Creates a new message record in the database
//         Retrieves the populated message with sender/receiver details
//         Emits the message to both sender and receiver in real-time
//         Sends a notification to the receiver
//         */
//         // Handle sending a message
//         socket.on("sendMessage", async ({ receiverId, content }) => {
//             if (!receiverId || !content) {
//                 socket.emit("error", { message: "Missing receiverId or content." });
//                 return;
//             }
//             // Send the message content/details to the database
//             const message = await Message.create({
//                 senderId: userId,
//                 receiverId,
//                 content,
//                 isRead: false,
//             });
//             // Retrieves the populated message with sender/receiver details
//             const populatedMessage = await Message.findByPk(message.id);
//             // Emit to both sender and receiver
//             io.to(userId).to(receiverId).emit("receiveMessage", populatedMessage);
//              io.to(receiverId).emit("newMessageNotification", { senderId: userId });
//         });
//         // Disconnect Handler: Logs when users disconnect from the socket.
//         socket.on("disconnect", () => {
//             console.log(`User disconnected: ${userId}`);
//         });
//     });
//     return io;
// };
// export default setupSocket;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = require("jsonwebtoken");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User")); // Ensure User model is imported for associations
const Vendor_1 = __importDefault(require("../models/Vendor"));
const config = require("../config/config");
const setupSocket = (httpServer) => {
    console.log("Initializing Socket.IO server...");
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.VITE_FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log("Socket authentication failed: No token provided");
            return next(new Error("Authentication error: No token provided."));
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, config.jwtSecret);
            socket.data.userId = decoded.id;
            socket.join(decoded.id);
            console.log(`Socket authenticated: User ${decoded.id} joined room`);
            next();
        }
        catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Authentication error: Invalid token."));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId}`);
        socket.on("sendMessage", async ({ receiverId, content }) => {
            const vendor = await Vendor_1.default.findByPk(receiverId);
            if (!vendor) {
                socket.emit("error", { message: "Vendor not found." });
                return;
            }
            const receiverUserId = vendor.UserId;
            if (!receiverId || !content) {
                console.log("Send message failed: Missing receiverId or content");
                socket.emit("error", { message: "Missing receiverId or content." });
                return;
            }
            try {
                const message = await Message_1.default.create({
                    senderId: userId,
                    receiverId: receiverUserId,
                    content,
                    isRead: false,
                });
                const populatedMessage = await Message_1.default.findByPk(message.id, {
                    include: [
                        { model: User_1.default, as: "Sender", attributes: ["id", "businessName", "email"] },
                        { model: User_1.default, as: "Receiver", attributes: ["id", "businessName", "email"] },
                    ],
                });
                io.to(userId).to(receiverId).emit("receiveMessage", populatedMessage);
                io.to(receiverId).emit("newMessageNotification", {
                    senderId: userId,
                    messageId: message.id,
                    content,
                });
                console.log(`Message sent from ${userId} to ${receiverId}: ${content}`);
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message." });
            }
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
    return io;
};
exports.default = setupSocket;
