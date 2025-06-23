"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express
const express_1 = __importDefault(require("express"));
// Importing cors for handling Cross-Origin Resource Sharing
const cors_1 = __importDefault(require("cors"));
// Importing dotenv to load env variables
const dotenv_1 = __importDefault(require("dotenv"));
// Importing Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./middleware/passport"));
// Loads .env file contents into process.env
dotenv_1.default.config();
// Initialize the Express application
const app = (0, express_1.default)();
// Middleware to parse incoming JSON requests (For communication using json in the server)
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// CORS options that allows to accept specific methods from a particular domain
const corsOptions = {
    // origin: "http://localhost:5173",
    origin: `${process.env.VITE_FRONTEND_URL}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
};
// Enable CORS
app.use((0, cors_1.default)(corsOptions));
const path_1 = __importDefault(require("path"));
// Serve static files from the uploads folder
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Routes
app.use('/auth', userRoutes_1.default);
app.use('/vendors', vendorRoutes_1.default);
app.use('/categories', categoryRoutes_1.default);
app.use('/products', productRoutes_1.default);
// Export app
exports.default = app;
