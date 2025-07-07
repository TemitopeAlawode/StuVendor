/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define interfaces based on backend response and product details
interface OrderProduct {
    ProductId: string;
    quantity: number;
    price: number;
    name?: string; // Added from product fetch
    description?: string;
    productImage?: string;
}

interface Order {
    id: string;
    UserId: string;
    totalAmount: number;
    shippingAddress: string;
    transactionId: string;
    orderStatus: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    createdAt: string;
    updatedAt: string;
    Products: OrderProduct[];
}

const CustomerOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Show 5 orders per page
    const navigate = useNavigate();

    // Fetch orders and product details
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: "Login Required",
                    text: "Please log in to view your orders.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                navigate("/auth/login");
                return;
            }

            try {
                // Fetch orders
                const response = await axios.get(`${API_BASE_URL}/auth/users/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const ordersData: Order[] = response.data;

                // Fetch product details for each order
                const updatedOrders = await Promise.all(
                    ordersData.map(async (order) => {
                        const productsWithDetails = await Promise.all(
                            order.Products.map(async (product) => {
                                try {
                                    const productResponse = await axios.get(
                                        `${API_BASE_URL}/products/${product.ProductId}`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    const productData = productResponse.data;
                                    return {
                                        ...product,
                                        name: productData.name,
                                        description: productData.description,
                                        productImage: productData.productImage,
                                    };
                                } catch (error: any) {
                                    console.error(`Failed to fetch product ${product.ProductId}:`, error);
                                    return {
                                        ...product,
                                        name: "Unknown Product",
                                        description: "Details unavailable",
                                        productImage: "https://via.placeholder.com/80",
                                    };
                                }
                            })
                        );
                        return { ...order, Products: productsWithDetails };
                    })
                );

                setOrders(updatedOrders);
            } catch (error: any) {
                console.error("Failed to fetch orders:", error.response?.data || error);
                setError(error.response?.data?.message || "Failed to load orders.");
                Swal.fire({
                    title: "Error",
                    text: error.response?.data?.message || "Failed to load orders.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    // Pagination logic
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = orders.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
                <div className="flex flex-col items-center" role="status" aria-live="polite">
                    <div className="w-16 h-16 border-4 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm sm:text-base text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <section className="flex-grow bg-gray-100 py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4 mb-6">
                    <BackButton aria-label="Go back" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
                </div>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    View your detailed order history below.
                </p>
                {error && <p className="text-center text-red-600 text-sm sm:text-base mb-4">{error}</p>}
                {orders.length === 0 ? (
                    <p className="text-sm sm:text-base text-gray-600">No orders found.</p>
                ) : (
                    <>
                        <div className="space-y-6">
                            {currentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-gray-500 transition-shadow"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Order ID:</strong> {order.id}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Order Date:</strong>{" "}
                                                {new Date(order.orderDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Total Amount:</strong> ₦{order.totalAmount.toLocaleString()}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Status:</strong>{" "}
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs sm:text-sm capitalize ${
                                                        order.orderStatus === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : order.orderStatus === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {order.orderStatus}
                                                </span>
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Transaction ID:</strong> {order.transactionId}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Customer:</strong> {order.customerName} (
                                                {order.customerEmail})
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Phone:</strong> {order.customerPhone}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Shipping Address:</strong> {order.shippingAddress}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Created:</strong>{" "}
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Last Updated:</strong>{" "}
                                                {new Date(order.updatedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <details className="mt-4">
                                        <summary className="text-sm sm:text-base text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                            View Products ({order.Products.length})
                                        </summary>
                                        <div className="mt-2">
                                            {order.Products.length === 0 ? (
                                                <p className="text-sm sm:text-base text-gray-600">
                                                    No products in this order.
                                                </p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm sm:text-base text-left text-gray-600">
                                                        <thead className="bg-gray-200 text-gray-800">
                                                            <tr>
                                                                <th className="p-2 sm:p-3">Image</th>
                                                                <th className="p-2 sm:p-3">Product</th>
                                                                <th className="p-2 sm:p-3">Quantity</th>
                                                                <th className="p-2 sm:p-3">Price</th>
                                                                <th className="p-2 sm:p-3">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.Products.map((product) => (
                                                                <tr
                                                                    key={product.ProductId}
                                                                    className="border-b border-gray-200"
                                                                >
                                                                    <td className="p-2 sm:p-3">
                                                                        <img
                                                                            src={
                                                                                product.productImage
                                                                                    ? `${API_BASE_URL}${product.productImage}`
                                                                                    : "https://via.placeholder.com/80"
                                                                            }
                                                                            alt={product.name || "Product"}
                                                                            className="w-16 h-16 object-cover rounded"
                                                                            onError={(e) =>
                                                                                (e.currentTarget.src =
                                                                                    "https://via.placeholder.com/80")
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 sm:p-3">
                                                                        <p className="font-semibold">
                                                                            {product.name || "Unknown Product"}
                                                                        </p>
                                                                        <p className="text-gray-500 text-sm">
                                                                            {product.description || "No description"}
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-2 sm:p-3">{product.quantity}</td>
                                                                    <td className="p-2 sm:p-3">
                                                                        ₦{product.price.toFixed(2)}
                                                                    </td>
                                                                    <td className="p-2 sm:p-3">
                                                                        ₦{(product.quantity * product.price).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                                        currentPage === 1
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-blue-950 text-white hover:bg-blue-900"
                                    }`}
                                    aria-label="Previous page"
                                >
                                    Previous
                                </button>
                                {(() => {
                                    const pages = [];
                                    for (let page = 1; page <= totalPages; page++) {
                                        pages.push(
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                                                    currentPage === page
                                                        ? "bg-blue-950 text-white"
                                                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                                                }`}
                                                aria-label={`Go to page ${page}`}
                                                aria-current={currentPage === page ? "page" : undefined}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    return pages;
                                })()}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                                        currentPage === totalPages
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-blue-950 text-white hover:bg-blue-900"
                                    }`}
                                    aria-label="Next page"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
            <Footer />
        </div>
    );
};

export default CustomerOrdersPage;























/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface DecodedJWToken {
    id: string;
    userType?: "customer" | "vendor" | "admin";
}

interface CountContextType {
    cartCount: number;
    likedProductsCount: number;
    orderNotificationCount: number;
    updateCounts: () => Promise<void>;
}

const CountContext = createContext<CountContextType | undefined>(undefined);

export const CountProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const [likedProductsCount, setLikedProductsCount] = useState(0);
    const [orderNotificationCount, setOrderNotificationCount] = useState(0);

    const updateCounts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartCount(0);
            setLikedProductsCount(0);
            setOrderNotificationCount(0);
            return;
        }

        try {
            // Decode token to get userType
            const decoded: DecodedJWToken = jwtDecode(token);

            // Fetch liked products
            const likedResponse = await axios.get(`${API_BASE_URL}/liked-products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const likedData = Array.isArray(likedResponse.data.likedProducts)
                ? likedResponse.data.likedProducts
                : [];
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
            console.error("Failed to fetch counts:", error);
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
        throw new Error("useCount must be used within a CountProvider");
    }
    return context;
};












