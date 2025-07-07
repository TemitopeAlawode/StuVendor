/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer"
import Header from "../components/Header"
import { useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    productImage: string;
    VendorId: string;
}

interface CartProduct {
    id: string;
    ProductId: string;
    quantity: number;
    totalPrice: number;
    Product: Product;
}

interface CheckoutState {
    cartProducts: CartProduct[];
    subtotal: number;
}

interface DecodedToken {
    id: string;
}


const CheckoutPage = () => {
    // Defining states
    const { state } = useLocation();
    const { cartProducts: initialCartProducts, subtotal: initialSubtotal } =
        (state as CheckoutState) || { cartProducts: [], subtotal: 0 };

    const [shippingFee, setShippingFee] = useState(5000); // Flat rate example

    const [cartProducts, setCartProducts] = useState<CartProduct[]>(initialCartProducts);
    const [subtotal, setSubtotal] = useState(initialSubtotal);

    // Calculate total price
    const calculateTotal = () => subtotal + shippingFee;

    const [fullName, setFullName] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [qtyLoading, setQtyLoading] = useState<{ [key: string]: boolean }>({}); // Per-product loading state
    const [paymentInitiated, setPaymentInitiated] = useState(false);


    const navigate = useNavigate();


    // <<<<---------------------------------->>>>
    // Fetch the user's data/profile for prefilling the input box.
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const decodedToken: DecodedToken = jwtDecode(token || '');
                const userId = decodedToken.id;
                console.log('User Id: ', userId);

                const response = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFullName(response.data.name);
                setEmail(response.data.email);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [])
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to update quantity in cart
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

        setQtyLoading((prev) => ({ ...prev, [cartProduct.id]: true })); // Set loading for this product
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/shopping-cart/${cartProduct.id}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Wait for 1 second to ensure loader is visible
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const updatedCartProducts = cartProducts.map((product) =>
                product.id === cartProduct.id
                    ? { ...product, quantity: response.data.quantity, totalPrice: response.data.totalPrice }
                    : product
            );
            setCartProducts(updatedCartProducts);
            setSubtotal(
                updatedCartProducts.reduce((subTotal, product) => subTotal + product.Product.price * product.quantity, 0)
            );


        } catch (error: any) {
            console.error("Failed to update quantity:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update quantity.",
                icon: "error",
            });
        } finally {
            setQtyLoading((prev) => ({ ...prev, [cartProduct.id]: false })); // Clear loading for this product
        }
    }
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Flutterwave payment configuration
    const handleFlutterwavePayment = useFlutterwave({
        public_key: FLUTTERWAVE_PUBLIC_KEY, // From .env
        tx_ref: Date.now().toString(), // Unique transaction reference
        amount: calculateTotal(),
        currency: 'NGN', // Nigerian Naira
        payment_options: 'card, bank, ussd', // Payment methods
        customer: {
            email: email,
            phone_number: phoneNumber,
            name: fullName,
        },
        customizations: {
            title: 'STUVENDOR Checkout',
            description: 'Payment for order',
            logo: 'STUVENDOR',
        },
        // The meta field sends cart product details to the backend for split calculation
        meta: {
            cart_products: JSON.stringify(
                cartProducts.map((pr) => ({
                    ProductId: pr.ProductId,
                    quantity: pr.quantity,
                    price: pr.Product.price,
                    VendorId: pr.Product.VendorId
                }))
            ),
        }
        //   onSuccess: (response) => {
        //     handlePaymentSuccess(response);
        //   },
        //   onClose: () => {
        //     closePaymentModal();
        //   },
        //   onError: (error) => {
        //     Swal.fire({
        //       title: 'Error',
        //       text: 'Payment failed. Please try again.',
        //       icon: 'error',
        //     });
        //   },
    });
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Function to handle payment
    const handlePayment = async () => {
        if (!fullName || !email || !phoneNumber || !shippingAddress) {
            Swal.fire({
                title: "Error",
                text: "Please fill in all shipping/delivery details.",
                icon: "error",
            });
            return;
        }

        setPaymentInitiated(true);

        try {
            handleFlutterwavePayment({
                callback: async (response) => {
                    setPaymentInitiated(false);

                    if (response.status === "successful") {
                        try {
                            const token = localStorage.getItem("token");
                            // Verify payment on backend
                            const verifyResponse = await axios.post(
                                `${API_BASE_URL}/payments/verify`,
                                {
                                    tx_ref: response.tx_ref,
                                    transaction_id: response.transaction_id
                                },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (verifyResponse.data.status === "success") {

                                // Create order
                                await axios.post(
                                    `${API_BASE_URL}/orders`,
                                    {
                                        shippingAddress,
                                        totalAmount: calculateTotal(),
                                        transactionId: response.tx_ref,
                                        customerName: fullName,
                                        customerEmail: email,
                                        customerPhone: phoneNumber,
                                        cartProducts: cartProducts.map((pr) => ({
                                            ProductId: pr.ProductId,
                                            quantity: pr.quantity,
                                            price: pr.Product.price,
                                            VendorId: pr.Product.VendorId
                                        })),
                                    },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );

                                // Trigger split calculation 
                                await axios.post(
                                    `${API_BASE_URL}/payments/split`,
                                    {
                                        transactionId: response.tx_ref,
                                        cartProducts: cartProducts.map((pr) => ({
                                            productId: pr.ProductId,
                                            quantity: pr.quantity,
                                            price: pr.Product.price,
                                            VendorId: pr.Product.VendorId
                                        })),
                                        totalAmount: calculateTotal(),
                                        deliveryFee: shippingFee,
                                    },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );

                                Swal.fire({
                                    title: "Success!",
                                    text: "Payment successful! Your order has been placed.",
                                    icon: "success",
                                })
                                console.log('Payment Verification Complete and Order created..');
                            }
                            else {
                                throw new Error("Payment verification failed.");
                            }

                            console.log('Successful payment');
                        } catch (error: any) {
                            Swal.fire({
                                title: "Error!",
                                text: error.response?.data?.message || "Payment verification failed.",
                                icon: "error",
                            });
                        }
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: "Payment failed. Please try again.",
                            icon: "error",
                        });
                    }
                    console.log("Payment response:", response);
                    closePaymentModal(); // this closes the modal programmatically
                },
                onClose: () => {
                    setPaymentInitiated(false);
                    console.log("Payment closed");
                    Swal.fire({
                        title: "Payment Cancelled",
                        text: "You closed the payment window.",
                        icon: "info",
                    });
                },
            });
        } catch (error) {
            setPaymentInitiated(false);
            Swal.fire({
                title: "Error",
                text: "Failed to initiate payment. Please try again.",
                icon: "error",
            });
        }
    }
    // <<<<---------------------------------->>>>


    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }


    if (!cartProducts.length) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <section className="py-12 px-8 text-center">
                    <p className="text-lg text-gray-600 mb-4">No items to checkout.</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Shop Now
                    </button>
                </section>
                <Footer />
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Component */}
            <Header />

            <section className="py-8 px-8">
                {/* Heading */}
                <div className="bg-blue-500 w-full p-3 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">Checkout</h1>
                    {/* <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-gray-400 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">DELIVERY DETAILS</h2>
                            <div className="space-y-4">

                                {/* Name Input */}
                                <div>
                                    <label className="block text-gray-700 font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-gray-700 font-medium">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                {/* Phone Number Input */}
                                <div>
                                    <label className="block text-gray-700 font-medium">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                        placeholder="Enter your phone number"
                                        maxLength={11}
                                        required
                                    />
                                </div>

                                {/* Shipping/Delivery Address Input */}
                                <div>
                                    <label className="block text-gray-700 font-medium">Shipping/Delivery Address</label>
                                    <textarea
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                        placeholder="Input the shipping or delivery address"
                                        maxLength={200}
                                        required
                                    />
                                </div>

                            </div>

                            {/* End of Shipping Details */}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">

                        <div className="bg-white rounded-xl shadow-gray-400 shadow-lg p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">YOUR ORDER</h2>
                            <div className="max-h-48 overflow-y-auto pr-2">
                                {/* Displaying products (with their details) from/in the cart */}
                                {cartProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between mb-4 border-b pb-2 border-dashed border-gray-400 relative"
                                    >

                                        {/* Loader */}
                                        {qtyLoading[product.id] && (
                                            <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}

                                        {/* Product Image */}
                                        <img
                                            src={`${API_BASE_URL}${product.Product.productImage}`}
                                            alt={product.Product.name}
                                            className="w-12 h-12 rounded-md object-cover"
                                        />

                                        {/* Product Details */}
                                        <div className="flex-1 pl-4">
                                            <p className="text-gray-900">{product.Product.name}</p>

                                            {/* <p className="text-gray-600">
                                                &#8358;{product.Product.price.toLocaleString()} x {product.quantity}
                                            </p> */}

                                            {/* Quantity */}
                                            <div className="flex items-center space-x-2">
                                                {/* '-' */}
                                                <button
                                                    onClick={() => handleUpdateQuantity(product, product.quantity - 1)}
                                                    className="cursor-pointer border border-gray-200 px-2 py-1 disabled:opacity-50"
                                                    disabled={qtyLoading[product.id]}
                                                >
                                                    <MinusIcon className="h-3 w-3 text-gray-800" />
                                                </button>
                                                <span className="text-center w-4">
                                                    {product.quantity}
                                                </span>
                                                {/* '+' */}
                                                <button
                                                    onClick={() => handleUpdateQuantity(product, product.quantity + 1)}
                                                    className="cursor-pointer border border-gray-200 px-2 py-1 disabled:opacity-50"
                                                    disabled={qtyLoading[product.id]}
                                                >
                                                    <PlusIcon className="h-3 w-3 text-gray-800" />
                                                </button>
                                            </div>

                                        </div>

                                        {/* Total Price */}
                                        <div className="text-right">
                                            <p className="text-gray-900 font-medium">
                                                &#8358;{product.totalPrice.toLocaleString()}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {/* Price breakdown */}
                            {/* Subtotal */}
                            <div className=" mt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-900 font-semibold">Subtotal</span>
                                    <span className="text-gray-900">&#8358;
                                        {subtotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Fee */}
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-900 font-semibold">Delivery Fee</span>
                                <span className="text-gray-900">&#8358;
                                    {shippingFee.toLocaleString()}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4 border-gray-400">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 text-lg font-semibold">Total</span>
                                    <span className="text-gray-900 text-lg font-semibold">&#8358;
                                        {calculateTotal().toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Pay Now and Place Order Button */}
                            <div>
                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors cursor-pointer"
                                    disabled={paymentInitiated}
                                >
                                    {paymentInitiated ? 'Processing...' : 'Pay Now and Place Order'}
                                </button>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            {/* Footer Component */}
            <Footer />
        </div>
    )
}

export default CheckoutPage;

