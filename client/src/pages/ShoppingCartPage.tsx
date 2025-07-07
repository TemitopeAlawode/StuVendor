/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

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

interface CartProduct {
    id: string;
    ProductId: string;
    UserId: string;
    quantity: number;
    totalPrice: number;
    Product: Product;
}

const ShoppingCartPage = () => {
    const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Use context for updating count
    const { updateCounts } = useCount(); 

    // <<<<---------------------------------->>>>
    useEffect(() => {
        const fetchCartProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    Swal.fire({
                        title: "Error!",
                        text: "Please log in to view your cart.",
                        icon: "error",
                        confirmButtonText: "OK",
                    }).then(() => {
                        navigate("/auth/login");
                    });
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/shopping-cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCartProducts(response.data.cartProducts || []);
            } catch (error: any) {
                console.error("Failed to fetch cart:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load cart items.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCartProducts();
    }, [navigate]);
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to calculate subtotal
    // .reduce(...): This method loops through all the items in the array and adds them up.
    // subtotal: This is the running total as we loop.
    // item.Product.price * item.quantity: This gives the total price for one cart item.
    // 0: This is the initial subtotal (we start counting from 0).
    const calculateSubtotal = () => {
        return cartProducts.reduce((subtotal, item) => subtotal + item.Product.price * item.quantity, 0);
    };

    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to handle quantity update
    const handleUpdateQuantity = async (cartProduct: CartProduct, newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > cartProduct.Product.stock) {
            Swal.fire({
                title: "Error!",
                text: `Quantity must be between 1 and ${cartProduct.Product.stock}.`,
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/shopping-cart/${cartProduct.id}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCartProducts(
                cartProducts.map((product) =>
                    product.id === cartProduct.id
                        ? { ...product, quantity: response.data.quantity, totalPrice: response.data.totalPrice }
                        : product
                )
            );

        } catch (error: any) {
            console.error("Failed to update quantity:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update quantity.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to handle deletion of product
    const handleDeleteProduct = async (cartProduct: CartProduct) => {
        // Show confirmation dialog before deleting
        const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: `Remove '${cartProduct.Product.name}' from your cart?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        });

        if (!confirmDelete.isConfirmed) {
            return;
        } // Exit if user cancels
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/shopping-cart/${cartProduct.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartProducts(cartProducts.filter((product) => product.id !== cartProduct.id));
            
            // Refresh counts
        await updateCounts(); 
        
            // Show success alert
            Swal.fire({
                title: "Removed!",
                text: `'${cartProduct.Product.name}' has been removed from your cart.`,
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error: any) {
            console.error("Failed to delete product:", error.response?.data || error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to delete product. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to handle checkout
     const handleCheckOut = () => {
        if (cartProducts.length === 0) {
          Swal.fire({
            title: "Error!",
            text: "Your cart is empty. Add items to proceed to checkout.",
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }
    
        // Validate stock availability
        const outOfStock = cartProducts.find((item) => item.quantity > item.Product.stock);
        if (outOfStock) {
          Swal.fire({
            title: "Error!",
            text: `Insufficient stock for ${outOfStock.Product.name}. Available: ${outOfStock.Product.stock}.`,
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }
    
        // Navigate to checkout page, passing cart data
        navigate("/checkout", { state: { cartProducts, subtotal: calculateSubtotal() } });
      };
    // <<<<---------------------------------->>>>


    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Component */}
            <Header />

            <section className="py-8 px-8">
                <div>

                    {/* Heading and Continue Shopping Button */}
                    <div className="flex items-center space-x-4 mb-8 justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
                        {/* Continue Shopping Button */}
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-white font-medium text-blue-600 border border-blue-600 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Continue Shopping
                        </button>

                    </div>

                    {/* Shopping Cart List */}
                    {cartProducts.length === 0 ? (
                        <div className="text-center">
                            <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
                            <button
                                onClick={() => navigate("/products")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">

                                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                                    {/* Products list */}
                                    {cartProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center space-x-4 border-b pb-4 last:border-b-0"
                                        >
                                            {/* Product Image */}
                                            <img
                                                src={`${API_BASE_URL}${product.Product.productImage}`}
                                                alt={product.Product.name}
                                                className="w-20 h-20 rounded-md object-cover"
                                            />

                                            {/* Product name and price */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{product.Product.name}</h3>
                                                <p className="text-gray-600">&#8358; {product.Product.price}</p>
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center space-x-2 ">
                                                {/* '-' */}
                                                <button
                                                    onClick={() => handleUpdateQuantity(product, product.quantity - 1)}
                                                    className="cursor-pointer border border-gray-200 px-2 py-1">
                                                    <MinusIcon className="h-5 w-5 text-gray-800" />
                                                </button>
                                                <span className="text-center w-12">
                                                    {product.quantity}
                                                </span>
                                                {/* '+' */}
                                                <button
                                                    onClick={() => handleUpdateQuantity(product, product.quantity + 1)}
                                                    className="cursor-pointer border border-gray-200 px-2 py-1">
                                                    <PlusIcon className="h-5 w-5 text-gray-800" />
                                                </button>
                                            </div>

                                            {/* Total Price and Delete Icon */}
                                            <div className="text-right">
                                                <p className="text-gray-900 font-medium">
                                                    &#8358; {product.totalPrice.toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className="text-red-600 hover:text-red-800 cursor-pointer mt-2">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                                    {/* Subtotal */}
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900">
                                            &#8358; {calculateSubtotal().toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Delivery Fee */}
                                    <div className="flex justify-between mb-4">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="text-gray-900">
                                            &#8358; TBD
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-900 text-lg font-semibold">Total</span>
                                            <span className="text-gray-900 text-lg font-semibold">
                                                &#8358; {calculateSubtotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <div>
                                        <button
                                            onClick={handleCheckOut}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors cursor-pointer"
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}

                </div>
            </section>

            {/* Footer Component */}
            <Footer />
        </div>
    )
}

export default ShoppingCartPage
