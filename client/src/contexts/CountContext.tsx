/* eslint-disable @typescript-eslint/no-explicit-any */
// createContext creates a Context object (CountContext).
// The CountContextType interface defines the shape of the data shared by the Context: cartCount, likedProductsCount, and an updateCounts function.
// The default value is undefined, but we’ll ensure it’s always set by wrapping components in a Provider.

import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


interface CountContextType {
    cartCount: number;
    likedProductsCount: number;
    orderNotificationCount: number;
    updateCounts: () => Promise<void>;
}

// Interface for decoded JWT payload to ensure type safety
interface DecodedJWToken {
    id: string; // User ID from the JWT
    userType?: 'customer' | 'vendor' | 'admin';
}


// The CountContext is defined to share the cart and liked products counts, along with a function to update them.
const CountContext = createContext<CountContextType | undefined>(undefined);

// The CountProvider component wraps the app and manages the state for cartCount and likedProductsCount. It also provides the updateCounts function to fetch the latest counts from the backend.
// useState hooks manage the cartCount and likedProductsCount locally within the CountProvider.
// The updateCounts function makes API calls to fetch the latest counts from the backend and updates the state with setCartCount and setLikedProductsCount.
// The Provider passes the value object { cartCount, likedProductsCount, updateCounts } to all components within its scope (i.e., all descendants of CountProvider).
// The children prop allows the CountProvider to wrap your app, making the Context available to components like Header.
export const CountProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const [likedProductsCount, setLikedProductsCount] = useState(0);
    const [orderNotificationCount, setOrderNotificationCount] = useState(0);

    const updateCounts = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCartCount(0);
            setLikedProductsCount(0);
            return;
        }
        try {
            // Decode token to get userType
        const decoded: DecodedJWToken = jwtDecode(token);

            // Fetch liked products from the backend
            const likedResponse = await axios.get(`${API_BASE_URL}/liked-products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Ensure response data is an array (backend returns { likedProducts: [...] })
            const likedData = Array.isArray(likedResponse.data.likedProducts)
                ? likedResponse.data.likedProducts
                : []; // Default to empty array if not an array
            // Update count with the number of liked products
            setLikedProductsCount(likedData.length);

            // Fetch cart count
            const cartResponse = await axios.get(`${API_BASE_URL}/shopping-cart/count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartCount(cartResponse.data.count);

             // Fetch vendor order count (only for vendors)
            if (decoded.userType === "vendor") {
                const orderResponse = await axios.get(`${API_BASE_URL}/vendors/orders/count`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrderNotificationCount(orderResponse.data.count);
            } else {
                setOrderNotificationCount(0);
            }
        } catch (error: any) {
            console.error('Failed to fetch counts:', error);
            setCartCount(0);
            setLikedProductsCount(0);
            setOrderNotificationCount(0);
        }
    };

return (
    <CountContext.Provider value={{ cartCount, likedProductsCount, orderNotificationCount, updateCounts }}>
        {children}
    </CountContext.Provider>
);
};


export const useCount = () => {
    const context = useContext(CountContext);
    if (!context) {
        throw new Error('useCount must be used within a CountProvider')
    }
    return context;
}
















// /* eslint-disable @typescript-eslint/no-explicit-any */
// // createContext creates a Context object (CountContext).
// // The CountContextType interface defines the shape of the data shared by the Context: cartCount, likedProductsCount, and an updateCounts function.
// // The default value is undefined, but we’ll ensure it’s always set by wrapping components in a Provider.

// import { createContext, useContext, useState, type ReactNode } from "react";
// import axios from "axios";


// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


// interface CountContextType {
//     cartCount: number;
//     likedProductsCount: number;
//     updateCounts: () => Promise<void>;
// }

// // The CountContext is defined to share the cart and liked products counts, along with a function to update them.
// const CountContext = createContext<CountContextType | undefined>(undefined);

// // The CountProvider component wraps the app and manages the state for cartCount and likedProductsCount. It also provides the updateCounts function to fetch the latest counts from the backend.
// // useState hooks manage the cartCount and likedProductsCount locally within the CountProvider.
// // The updateCounts function makes API calls to fetch the latest counts from the backend and updates the state with setCartCount and setLikedProductsCount.
// // The Provider passes the value object { cartCount, likedProductsCount, updateCounts } to all components within its scope (i.e., all descendants of CountProvider).
// // The children prop allows the CountProvider to wrap your app, making the Context available to components like Header.
// export const CountProvider = ({ children }: { children: ReactNode }) => {
//     const [cartCount, setCartCount] = useState(0);
//     const [likedProductsCount, setLikedProductsCount] = useState(0);

//     const updateCounts = async () => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             setCartCount(0);
//             setLikedProductsCount(0);
//             return;
//         }
//         try {
//             // Fetch liked products from the backend
//             const likedResponse = await axios.get(`${API_BASE_URL}/liked-products`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             // Ensure response data is an array (backend returns { likedProducts: [...] })
//             const likedData = Array.isArray(likedResponse.data.likedProducts)
//                 ? likedResponse.data.likedProducts
//                 : []; // Default to empty array if not an array
//             // Update count with the number of liked products
//             setLikedProductsCount(likedData.length);

//             // Fetch cart count
//             const cartResponse = await axios.get(`${API_BASE_URL}/shopping-cart/count`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setCartCount(cartResponse.data.count);
//         } catch (error: any) {
//             console.error('Failed to fetch counts:', error);
//             setCartCount(0);
//             setLikedProductsCount(0);
//         }
//     };

// return (
//     <CountContext.Provider value={{ cartCount, likedProductsCount, updateCounts }}>
//         {children}
//     </CountContext.Provider>
// );
// };


// export const useCount = () => {
//     const context = useContext(CountContext);
//     if (!context) {
//         throw new Error('useCount must be used within a CountProvider')
//     }
//     return context;
// }