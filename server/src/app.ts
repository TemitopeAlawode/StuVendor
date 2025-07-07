// Importing express
import express from 'express';

// Importing cors for handling Cross-Origin Resource Sharing
import cors from 'cors';

// Importing dotenv to load env variables
import dotenv from 'dotenv';

import path from "path";

// Importing Routes
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import likedProductRoutes from './routes/likedProductRoutes';
import searchedProductRoutes from './routes/searchedProductRoutes';
import shoppingCartRoutes from './routes/shoppingCartRoutes';
import viewedProductsRoutes from './routes/viewedProductsRoutes';
import recommendationsRoutes from './routes/recommendationsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import orderRoutes from './routes/orderRoutes';


import session from 'express-session';
import passport from './middleware/passport';

// Loads .env file contents into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON requests (For communication using json in the server)
app.use(express.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS options that allows to accept specific methods from a particular domain
const corsOptions = {
  // origin: "http://localhost:5173",
  origin: `${process.env.VITE_FRONTEND_URL}`,
  methods: ["POST", "GET", "PUT", "DELETE"],
};

// Enable CORS
app.use(cors(corsOptions));


// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/auth', userRoutes);
app.use('/vendors', vendorRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/liked-products', likedProductRoutes);
app.use('/searched-products', searchedProductRoutes);
app.use('/shopping-cart', shoppingCartRoutes);
app.use('/viewed-products', viewedProductsRoutes);
app.use('/api', recommendationsRoutes);
app.use('/payments', paymentRoutes);
app.use('/orders', orderRoutes);

// Export app
export default app;
