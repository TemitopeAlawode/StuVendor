/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton"
import Header from "../components/Header"
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import Footer from "../components/Footer";

// Import the context hook
import { useCount } from "../contexts/CountContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define Product interface
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

// Define LikedProduct interface
interface LikedProduct {
    ProductId: string;
    UserId: string;
    VendorId: string;
    likeTimestamp: string;
    Product: Product;
}

const LikedProductsPage = () => {

  // State to store the list of liked products
    const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);

    // State to show a loading spinner while fetching data
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Use context for updating count
    const { updateCounts } = useCount(); 

    // ---------------------------------->>
    // Fetch liked products on component mount
    useEffect(() => {
        const fetchLikedProducts = async () => {
            // Show loading spinner
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    Swal.fire({
                        title: "Login Required",
                        text: "Please log in to view liked products.",
                        icon: "warning",
                        confirmButtonText: "OK",
                    });
                    navigate("/auth/login");
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/liked-products`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Ensure response data is an array (backend returns { likedProducts: [...] })
                const data = Array.isArray(response.data.likedProducts)
                    ? response.data.likedProducts
                    : []; // Default to empty array if not an array
                // Update liked products state
                setLikedProducts(data);
            } catch (error: any) {
                console.error("Failed to fetch liked products:", error.response?.data || error);
                Swal.fire({
                    title: "Error",
                    text: error.response?.data?.message || "Failed to load liked products.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
            finally {
                // Hide loading spinner
                setLoading(false);
            }
        };

        fetchLikedProducts(); // Run the fetch function
    }, [navigate]);
    // ---------------------------------->>


    // ---------------------------------->>>>
    // Function to handle Unlike button click
    const handleUnlikeClick = async (productId: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire({
                    title: "Login Required",
                    text: "Please log in to unlike products.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                navigate("/auth/login");
                return;
            }

            // Unlike product
            // If product is already liked, send request to unlike it
            await axios.delete(`${API_BASE_URL}/liked-products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove productId from likedProducts state
            // filter() goes through each item (item) in the likedProducts array.
            // It keeps only the items that are not equal to productId.
            // This effectively removes the given productId from the list.
            setLikedProducts(likedProducts.filter((item) => item.ProductId !== productId));
            
            await updateCounts(); // Refresh counts

            // Show success message
            Swal.fire({
                title: "Success",
                text: "Product unliked.",
                icon: "success",
                timer: 1500, // Auto-close after 1.5 seconds
            });
        } catch (error: any) {
            console.error("Failed to unlike product:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Failed to unlike product.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }
    // ---------------------------------->>>>


    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading liked products...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header component */}
            <Header />

            {/* Main content */}
            <section className="bg-gray-100 min-h-[87vh] p-8">

                <div className="flex items-center space-x-4 mb-10">
                    {/* Button for navigating back to previous page*/}
                    <BackButton />

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-800">
                        Liked Products
                    </h1>
                </div>

                {/* Sub Heading */}
                <p className="text-gray-600 mb-6">Explore all your liked products below.</p>

 {/* Show message if no liked products, otherwise display products */}
        {likedProducts.length === 0 ? (
          <p className="text-gray-600">You haven't liked any products yet.</p>
        ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {/* Liked products list */}
                    {likedProducts.map((lProduct) => (

                        <div key={lProduct.ProductId}>
                            {/* Link to product details page */}
                            <Link
                                to={`/products/${lProduct.ProductId}`}
                            >
                                {/* Product Card */}
                                <div className="bg-white p-6 rounded-lg shadow-md relative h-84 cursor-pointer hover:shadow-gray-500">
                                    {/* Unlike button with heart icon */}
                                    <div className="absolute top-4 right-4 bg-gray-200 w-11 h-11 rounded-full flex items-center justify-center">
                                        <button
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault() // prevent link navigation to product details page
                                                handleUnlikeClick(lProduct.ProductId) // Handle unlike
                                            }}
                                        >
                                            <FaHeart className="text-red-600" />
                                        </button>
                                    </div>

                                    {/* Product image */}
                                    <img
                                        src={`${API_BASE_URL}${lProduct.Product.productImage}`}
                                        alt={lProduct.Product.name}
                                        className="rounded-md h-40 w-full object-cover mb-4"
                                    />

                                    {/* Product details */}
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {lProduct.Product.name}
                                    </h3>
                                    <p className="text-gray-600"> &#8358;{lProduct.Product.price} </p>
                                    <p className="text-gray-600">Stock: {lProduct.Product.stock} </p>
                                    <p className="text-gray-600"> {lProduct.Product.description} </p>
                                </div>
                                {/* End of Product Card */}
                            </Link>
                        </div>
                    ))}
                </div>
        )}
            </section>
            
             {/* Footer component */}
      <Footer />
        </div>
    )
}

export default LikedProductsPage
