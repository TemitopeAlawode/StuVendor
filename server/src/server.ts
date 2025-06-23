// Importing app.js file
import app from './app';


// import dotenv from "dotenv";
// dotenv.config();

// Defining the PORT the server will listen on 
const PORT = process.env.PORT || 5000;

// To start up the server and listen on the defined PORT 
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})

// To test if it's working on Postman
app.get('', (req, res) => {
res.status(200).json({message: "Welcome, StuVendor Backend is running fine..."})
// res.status(200).json({message: "Welcome, it's running and working fine..."})
});