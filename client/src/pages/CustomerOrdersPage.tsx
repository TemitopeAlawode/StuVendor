/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton"
import Footer from "../components/Footer"
import Header from "../components/Header"
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


const CustomerOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Fetch orders and product details
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);

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

                // Promise.all takes the array of Promises and waits for all to resolve
                // Processes each order in ordersData concurrently to fetch product details for all orders.
                const fullOrders = await Promise.all(
                    ordersData.map(async (order) => {
                        // For each order, fetch details for all products in order.Products concurrently
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
                                        description: "No description",
                                        productImage: "unknown image",
                                    };
                                }
                            })
                        );
                        return { ...order, Products: productsWithDetails };
                    })
                );

                setOrders(fullOrders);

            } catch (error: any) {
                console.error("Failed to fetch orders:", error.response?.data || error);
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
                    <BackButton />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
                </div>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    View your detailed order history below.
                </p>

                {orders.length === 0 ? (
                    <p className="text-sm sm:text-base text-gray-600">No orders found.</p>
                ) : (
                    <>
                        <div className="space-y-6">
                            {orders.map((order) => (
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
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Total Amount:</strong>  &#8358;{order.totalAmount.toLocaleString()}
                                            </p>

                                            {/* <label htmlFor="" className="text-sm sm:text-base text-gray-600">
                                                 <strong>Status:</strong>
                                                <select name="" id=""
                                                className="rounded-lg border border-gray-300">
                                                    <option className="bg-yellow-100 text-yellow-800" value={order.orderStatus}>{order.orderStatus}</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </label> */}

                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Status:</strong>{" "}
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs sm:text-sm capitalize ${order.orderStatus === "pending"
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
                                                <strong>Phone Number:</strong> {order.customerPhone}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                <strong>Shipping Address:</strong> {order.shippingAddress}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Product details */}
                                    <details>
                                        <summary className="text-sm sm:text-base text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                            View Products ({order.Products.length})
                                        </summary>
                                        <div>
                                            {order.Products.length === 0 ? (
                                                <p className="text-sm sm:text-base text-gray-600">
                                                    No products in this order.
                                                </p>
                                            ) : (
                                                <div>
                                     <table className="w-full text-sm sm:text-base text-left text-gray-600">
                                                           <thead className="bg-gray-200 text-gray-800">
                                                            <tr>
                                                                <th className="p-2 sm:p-3">Image</th>
                                                                <th className="p-2 sm:p-3">Product</th>
                                                                <th className="p-2 sm:p-3">Quantity</th>
                                                                <th className="p-2 sm:p-3">Price</th>
                                                                <th className="p-2 sm:p-3">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.Products.map((product) => (
                                                                <tr
                                                                key={product.ProductId}
                                                                className="border-b border-gray-300"
                                                                >
                                                                    <td className="p-3">
                                                                        {/* Image */}
                                                                        <img 
                                                                        src={`${API_BASE_URL}${product.productImage}`} 
                                                                        className="w-16 h-16 object-cover rounded"
                                                                        alt={product.name} />
                                                                    </td>
                                                                    {/* Name and description */}
                                                                    <td className="p-3">
                                                                        <p className="font-semibold">
                                                                            {product.name || "Unknown Product"}
                                                                        </p>
                                                                        <p className="text-gray-500 text-sm">
                                                                            {product.description || "No description"}
                                                                        </p>
                                                                    </td>
                                                                    {/* Qty */}
                                                                    <td className="p-3">
                                                                        {product.quantity}
                                                                    </td>
                                                                    {/* Price */}
                                                                    <td className="p-3">
                                                                         &#8358;{product.price}
                                                                        </td>
                                                                        {/* Amount */}
                                                                        <td className="p-3">
                                                                         &#8358;{(product.quantity * product.price).toLocaleString()}
                                                                         </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                             <tr className="bg-gray-100 font-bold text-gray-800">
                                                                <td colSpan={4} className="p-2 sm:p-3 text-right">
                                                                    Total Amount:
                                                                </td>
                                                                <td className="p-2 sm:p-3">
                                                                     &#8358;{order.totalAmount.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </>
                )}


            </section>
            <Footer />
        </div>
    )
}

export default CustomerOrdersPage
