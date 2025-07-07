/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2";
import SearchBar from "./SearchBar";
import { ArrowRightOnRectangleIcon, BellIcon, HeartIcon, ShoppingCartIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// Import the context hook
import { useCount } from "../contexts/CountContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    VendorId: string;
    CategoryId: string;
    stock: number;
    productImage: string;
}

// Interface for decoded JWT payload to ensure type safety
interface DecodedJWToken {
    id: string; // User ID from the JWT
    userType?: 'customer' | 'vendor' | 'admin';
}


const Header = () => {

    // For real time search suggestion
    const [products, setProducts] = useState<Product[]>([]);

    const navigate = useNavigate();
    // State to check if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // State for the userType
    const [userType, setUserType] = useState<'customer' | 'vendor' | 'admin' | null>(null);

    const { cartCount, likedProductsCount, orderNotificationCount, updateCounts } = useCount(); // Use context

    // Check for token and fetch liked products count on component mount (On page load)
    useEffect(() => {
        const token = localStorage.getItem('token');
        // Convert token to boolean value
        // If token exists, isLoggedIn will be true otherwise, false.
        setIsLoggedIn(!!token);

        if (!token) return;

        // Fetch user data, liked products and cart count if user is logged in
        const fetchUserData = async () => {
            try {
                // Decode the token to get userType
                const decodedToken: DecodedJWToken = jwtDecode(token);
                const userId = decodedToken.id;

                // Fetch User Details
                const userResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserType(userResponse.data.userType);

                // Fetch counts
        await updateCounts(); // Use context's updateCounts

            } catch (error: any) {
                console.error('Failed to load user details/liked products/cart count: ', error);
                // If no token is fount OR jwt has expired
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    Swal.fire({
                        title: "Session Expired",
                        text: "Please log in again.",
                        icon: "warning",
                        confirmButtonText: "OK",
                    }).then(() => navigate("/auth/login"));
                }
            }
        };

        fetchUserData();  // Run the function
    }, [navigate, updateCounts]); 


    const handleLogOut = () => {
        localStorage.removeItem("token");
        Swal.fire({
            title: "Success!",
            text: "Logged out successfully!",
            icon: "success",
            confirmButtonText: "OK",
        }).then(() => {
            // Redirect to the home page after logging out
            navigate("/");
        });
    }

    // Handle search results from SearchBar
    const handleSearchResults = (results: Product[]) => {
        setProducts(results);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (product: Product) => {
        // Already handled by navigation in SearchBar
    };

    // Handle Profile icon click
    const handleProfileClick = () => {
        if (!isLoggedIn) {
            navigate('/auth/login');
            return;
        }
        navigate(
            userType === 'vendor'
                ? '/vendor-dashboard'
                : '/customer-dashboard'
        )
    };


    return (
        <header className="sticky top-0 z-50 bg-gray-800 text-white p-5 min-h-[10vh]">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-3xl font-extrabold hover:scale-x-105  transform transition duration-300">
                    <span
                        className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to to-blue-600">
                        STUVENDOR
                    </span>
                </Link>

                {/* Search Bar component */}
                <div className="w-full md:w-1/3 my-4 md:my-0">
                    <SearchBar
                        onSearchResults={handleSearchResults}
                        onSelectSuggestion={handleSelectSuggestion}
                    />
                </div>

                {/* Navigation bars */}
                <nav className="flex items-center space-x-6">
                    {isLoggedIn ? (
                        <>
                            {/* Profile Icon */}
                            <button
                                onClick={handleProfileClick}
                                className="hover:scale-110 transform transition duration-200 cursor-pointer"
                                aria-label="Go to dashboard"
                            >
                                <UserCircleIcon className="h-7 w-7 hover:text-blue-400" />
                            </button>

                            {/* Notification icon */}
                            <button 
                            onClick={() => navigate("/vendor/orders")}
                            className="relative">
                                <BellIcon className="h-7 w-7 hover:text-blue-400 cursor-pointer" />
                            <span className="absolute bg-red-500 rounded-full flex justify-center w-5 h-5 items-center -top-2 -right-2 text-xs">
                                {orderNotificationCount}
                                </span>
                            </button>

                            {/* Liked Products/Favorites Icon */}
                            <Link
                                to='/liked-products'
                                className="hover:scale-110 transform transition duration-200 relative"
                            >
                                <HeartIcon className="h-7 w-7 hover:text-blue-400" />
                                {/* Favorites/Liked Products Count */}
                                <span className="absolute bg-red-500 rounded-full flex justify-center w-5 h-5 items-center -top-2 -right-2 text-xs">
                                    {likedProductsCount}
                                </span>
                            </Link>

                            {/* Cart Icon */}
                            <Link
                                to='/shopping-cart'
                                className="hover:scale-110 transform transition duration-200 relative"
                            >
                                <ShoppingCartIcon className="h-7 w-7 hover:text-blue-400" />
                                {/* Products in cart Count */}
                                <span className="absolute bg-red-500 rounded-full flex justify-center w-5 h-5 items-center -top-2 -right-2 text-xs">
                                    {cartCount}
                                </span>
                            </Link>

                            {/* Logout Button */}
                            <button onClick={handleLogOut}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2 transform transition duration-200 hover:scale-105">
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Signup button */}
                            <Link to="/auth/signup" className="hover:text-blue-400 font-medium transition duration-200"
                            >
                                Signup
                            </Link>

                            {/* Login button */}
                            <Link
                                to="/auth/login"
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition duration-200">
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header;































/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Link, useNavigate } from "react-router-dom"
// import Swal from "sweetalert2";
// import SearchBar from "./SearchBar";
// import { ArrowRightOnRectangleIcon, BellIcon, HeartIcon, ShoppingCartIcon, UserCircleIcon } from "@heroicons/react/24/outline";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// // Import the context hook
// import { useCount } from "../contexts/CountContext";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// interface Product {
//     id: string;
//     name: string;
//     description?: string;
//     price: number;
//     VendorId: string;
//     CategoryId: string;
//     stock: number;
//     productImage: string;
// }

// // Interface for decoded JWT payload to ensure type safety
// interface DecodedJWToken {
//     id: string; // User ID from the JWT
//     userType?: 'customer' | 'vendor' | 'admin';
// }


// const Header = () => {

//     // For real time search suggestion
//     const [products, setProducts] = useState<Product[]>([]);

//     const navigate = useNavigate();
//     // State to check if user is logged in
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     // State for the userType
//     const [userType, setUserType] = useState<'customer' | 'vendor' | 'admin' | null>(null);

//     const { cartCount, likedProductsCount, updateCounts } = useCount(); // Use context

//     // Check for token and fetch liked products count on component mount (On page load)
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         // Convert token to boolean value
//         // If token exists, isLoggedIn will be true otherwise, false.
//         setIsLoggedIn(!!token);

//         if (!token) return;

//         // Fetch user data, liked products and cart count if user is logged in
//         const fetchUserData = async () => {
//             try {
//                 // Decode the token to get userType
//                 const decodedToken: DecodedJWToken = jwtDecode(token);
//                 const userId = decodedToken.id;

//                 // Fetch User Details
//                 const userResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 setUserType(userResponse.data.userType);

//                 // Fetch counts
//         await updateCounts(); // Use context's updateCounts

//             } catch (error: any) {
//                 console.error('Failed to load user details/liked products/cart count: ', error);
//                 // If no token is fount OR jwt has expired
//                 if (error.response?.status === 401) {
//                     localStorage.removeItem("token");
//                     setIsLoggedIn(false);
//                     Swal.fire({
//                         title: "Session Expired",
//                         text: "Please log in again.",
//                         icon: "warning",
//                         confirmButtonText: "OK",
//                     }).then(() => navigate("/auth/login"));
//                 }
//             }
//         };

//         fetchUserData();  // Run the function
//     }, [navigate, updateCounts]); 


//     const handleLogOut = () => {
//         localStorage.removeItem("token");
//         Swal.fire({
//             title: "Success!",
//             text: "Logged out successfully!",
//             icon: "success",
//             confirmButtonText: "OK",
//         }).then(() => {
//             // Redirect to the home page after logging out
//             navigate("/");
//         });
//     }

//     // Handle search results from SearchBar
//     const handleSearchResults = (results: Product[]) => {
//         setProducts(results);
//     };

//     // Handle suggestion selection
//     const handleSelectSuggestion = (product: Product) => {
//         // Already handled by navigation in SearchBar
//     };

//     // Handle Profile icon click
//     const handleProfileClick = () => {
//         if (!isLoggedIn) {
//             navigate('/auth/login');
//             return;
//         }
//         navigate(
//             userType === 'vendor'
//                 ? '/vendor-dashboard'
//                 : '/customer-dashboard'
//         )
//     };


//     return (
//         <header className="sticky top-0 z-50 bg-gray-800 text-white p-5 min-h-[10vh]">
//             <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">

//                 {/* Logo */}
//                 <Link
//                     to="/"
//                     className="text-3xl font-extrabold hover:scale-x-105  transform transition duration-300">
//                     <span
//                         className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to to-blue-600">
//                         STUVENDOR
//                     </span>
//                 </Link>

//                 {/* Search Bar component */}
//                 <div className="w-full md:w-1/3 my-4 md:my-0">
//                     <SearchBar
//                         onSearchResults={handleSearchResults}
//                         onSelectSuggestion={handleSelectSuggestion}
//                     />
//                 </div>

//                 {/* Navigation bars */}
//                 <nav className="flex items-center space-x-6">
//                     {isLoggedIn ? (
//                         <>
//                             {/* Profile Icon */}
//                             <button
//                                 onClick={handleProfileClick}
//                                 className="hover:scale-110 transform transition duration-200 cursor-pointer"
//                                 aria-label="Go to dashboard"
//                             >
//                                 <UserCircleIcon className="h-7 w-7 hover:text-blue-400" />
//                             </button>

//                             {/* Notification icon */}
//                             <button>
//                                 <BellIcon className="h-7 w-7 hover:text-blue-400 cursor-pointer" />
//                             </button>

//                             {/* Liked Products/Favorites Icon */}
//                             <Link
//                                 to='/liked-products'
//                                 className="hover:scale-110 transform transition duration-200 relative"
//                             >
//                                 <HeartIcon className="h-7 w-7 hover:text-blue-400" />
//                                 {/* Favorites/Liked Products Count */}
//                                 <span className="absolute bg-red-500 rounded-full flex justify-center w-5 h-5 items-center -top-2 -right-2 text-xs">
//                                     {likedProductsCount}
//                                 </span>
//                             </Link>

//                             {/* Cart Icon */}
//                             <Link
//                                 to='/shopping-cart'
//                                 className="hover:scale-110 transform transition duration-200 relative"
//                             >
//                                 <ShoppingCartIcon className="h-7 w-7 hover:text-blue-400" />
//                                 {/* Products in cart Count */}
//                                 <span className="absolute bg-red-500 rounded-full flex justify-center w-5 h-5 items-center -top-2 -right-2 text-xs">
//                                     {cartCount}
//                                 </span>
//                             </Link>

//                             {/* Logout Button */}
//                             <button onClick={handleLogOut}
//                                 className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2 transform transition duration-200 hover:scale-105">
//                                 <ArrowRightOnRectangleIcon className="h-5 w-5" />
//                                 <span>Logout</span>
//                             </button>
//                         </>
//                     ) : (
//                         <>
//                             {/* Signup button */}
//                             <Link to="/auth/signup" className="hover:text-blue-400 font-medium transition duration-200"
//                             >
//                                 Signup
//                             </Link>

//                             {/* Login button */}
//                             <Link
//                                 to="/auth/login"
//                                 className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition duration-200">
//                                 Login
//                             </Link>
//                         </>
//                     )}
//                 </nav>
//             </div>
//         </header>
//     )
// }

// export default Header;
