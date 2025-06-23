"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing app.js file
const app_1 = __importDefault(require("./app"));
// import dotenv from "dotenv";
// dotenv.config();
// Defining the PORT the server will listen on 
const PORT = process.env.PORT || 5000;
// To start up the server and listen on the defined PORT 
app_1.default.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
// To test if it's working on Postman
app_1.default.get('', (req, res) => {
    res.status(200).json({ message: "Welcome, StuVendor Backend is running fine..." });
    // res.status(200).json({message: "Welcome, it's running and working fine..."})
});
