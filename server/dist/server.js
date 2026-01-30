"use strict";
// // Importing app.js file
// import app from './app';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // import dotenv from "dotenv";
// // dotenv.config();
// // Defining the PORT the server will listen on 
// const PORT = process.env.PORT || 5000;
// // To start up the server and listen on the defined PORT 
// app.listen(PORT, () => {
//     console.log(`Server is running on PORT ${PORT}`);
// })
// // To test if it's working on Postman
// app.get('', (req, res) => {
// res.status(200).json({message: "Welcome, StuVendor Backend is running fine..."})
// // res.status(200).json({message: "Welcome, it's running and working fine..."})
// });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./utils/socket"));
const httpServer = http_1.default.createServer(app_1.default);
// Initialize Socket.IO
const io = (0, socket_1.default)(httpServer);
// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
// Test route
app_1.default.get("", (req, res) => {
    res.status(200).json({ message: "Welcome, StuVendor Backend is running fine..." });
});
