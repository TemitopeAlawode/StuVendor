/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Footer from "../components/Footer";
import Header from "../components/Header";

// Import the context hook
import { useCount } from "../contexts/CountContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define Product interface for type safety
interface Product {
    id: string; // UUID is a string
    name: string;
    description?: string; // this should probably be optional
    price: number;
    VendorId: string;
    CategoryId: string;
    stock: number;
    productImage: string;
}

interface Vendor {
    id: string;
    businessName: string;
    createdAt: Date;
}

const ProductDetailsPage = () => {
    // Get product ID from the URL
    const { id } = useParams();

    // Hook to navigate to other routes
    const navigate = useNavigate();

    // State to store the product, vendor, quantity
    const [product, setProduct] = useState<Product | null>(null);
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Use context for updating count
    const { updateCounts } = useCount();

    // State for chat modal
    const [isChatOpen, setIsChatOpen] = useState(false);

    // For date and timestamp
    const now = new Date();
    const formattedDateTime = `${now.toDateString()} ${now.toLocaleTimeString()}`;


    // <<<<---------------------------------->>>>
    useEffect(() => {
        const fetchProductAndVendor = async () => {
            try {
                // Fetch product details by id
                const productResponse = await axios.get(`${API_BASE_URL}/products/${id}`);
                setProduct(productResponse.data);

                // Fetch vendor details using VendorId
                const vendorResponse = await axios.get(`${API_BASE_URL}/vendors/${productResponse.data.VendorId}`);
                setVendor(vendorResponse.data);

                // Record product view for logged-in users
                const token = localStorage.getItem('token');
                if (token && productResponse && vendorResponse) {
                    await axios.post(`${API_BASE_URL}/viewed-products`,
                        {
                            ProductId: productResponse.data.id,
                            VendorId: productResponse.data.VendorId
                        },
                        { headers: { Authorization: `Bearer ${token}` }, }
                    );
                }

            } catch (error: any) {
                console.error("Failed to fetch product or vendor:", error.response?.data || error);
                if (error.response?.status === 404) {
                    Swal.fire({
                        title: "Error!",
                        text: "Product not found.",
                        icon: "error",
                        confirmButtonText: "OK",
                    }).then(() => {
                        navigate("/products"); // Redirect to products list if product not found
                    });
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to load product details. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                };
            };
        };
        fetchProductAndVendor();
    }, [id, navigate]); // Dependency array ensures effect runs when navigate changes
    // <<<<---------------------------------->>>>


    // <<<<---------------------------------->>>>
    // Handle Add to Cart with quantity
    const handleAddToCart = async () => {
        if (!product || quantity > product.stock) {
            Swal.fire({
                title: 'Error!',
                text: `Quantity cannot exceed available stock (${product?.stock || 0}).`,
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: "Login Required",
                text: "Please log in to add items to your cart.",
                icon: "warning",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/auth/login");
            });
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/shopping-cart/add-to-cart`,
                { ProductId: product.id, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh counts
            await updateCounts();

            Swal.fire({
                title: 'Added to Cart!',
                text: `${product.name} (x${quantity}) has been added to your cart.`,
                icon: "success",
                confirmButtonText: "View Cart",
                showCancelButton: true,
                cancelButtonText: "Continue Shopping",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/shopping-cart');
                }
            });
        } catch (error: any) {
            console.error("Failed to add to cart:", error.response?.data || error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add item to cart.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }
    // <<<<---------------------------------->>>>


    return (
        <div>
            {/* Header Component */}
            <Header />

            <main className="bg-gray-100 py-8">

                <div className="container px-4 mx-auto">

                    {/* Product Card */}
                    <div className="bg-white rounded-lg p-6 shadow-md md:flex md:space-x-6">

                        {/* Product Image */}
                        <div className="md:w-1/2 mb-6 md:mb-0">
                            <img
                                src={`${API_BASE_URL}${product?.productImage}`}
                                alt={product?.name}
                                className="object-cover rounded-lg w-full h-96"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="mt-7">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product?.name}</h1>
                            <p className="text-2xl text-green-600 font-semibold mb-4">&#8358; {product?.price}</p>
                            <p className="text-gray-600 mb-6">{product?.description}</p>

                            {/* Additional Details */}
                            <div className="mb-6">
                                <p className="text-gray-700">
                                    <strong>Vendor: </strong>
                                    {vendor?.businessName}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Stock: </strong>
                                    {product?.stock}
                                </p>
                            </div>

                            {/* Quantity */}
                            <div className="mb-6">
                                <label htmlFor="quantity"
                                    className="text-gray-700 font-bold"> Quantity: </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))} // Convert string to number
                                    min={1}
                                    max={product?.stock}
                                    className="border border-gray-400 rounded-lg w-20 px-2 py-1 cursor-pointer "
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    className="bg-blue-950 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors cursor-pointer"
                                    onClick={handleAddToCart}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                                    onClick={() => navigate("/products")}
                                >
                                    Back to Products
                                </button>
                                <button
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                                    onClick={() => setIsChatOpen(true)}
                                >
                                    Chat with Vendor
                                </button>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat with {vendor?.businessName}</h2>

                            <div className="flex-grow max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                <div>


                                    <p className="text-xs text-gray-400 mt-1">{formattedDateTime}</p>
                                    {/* <p className="text-xs text-gray-400 mt-1">
                                    {new Date().toLocaleString()}
                                    </p> */}

                                </div>
                            </div>

                            <textarea
                                className="w-full border border-gray-400 rounded-lg p-2 mb-4 text-sm sm:text-base"
                                rows={4}
                                placeholder="Type your message here..."
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    onClick={() => setIsChatOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* End of Chat Modal */}
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    )
}



export default ProductDetailsPage;
