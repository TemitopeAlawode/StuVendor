/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios"; // Import axios for HTTP requests

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

// Define Category interface for type safety
interface Category {
    id: string;
    name: string;
}

const EditProductPage = () => {
    // Get product ID from URL
    const { id } = useParams();

    // Hook to navigate to other routes
    const navigate = useNavigate();

    // State to store the product and categories
    // const [product, setProduct] = useState<Product>();
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form states
    const [productImage, setProductImage] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [stock, setStock] = useState("");

      // For Loading after editing..
      const [loading, setLoading] = useState(false);

    // Effect to check authentication and fetch data on component/page mount
    useEffect(() => {
        // Get JWT token from local storage
        const token = localStorage.getItem("token");
        // If no token, show error and redirect to login
        if (!token) {
            Swal.fire({
                title: "Error!",
                text: "You must be logged as a vendor to edit products..",
                icon: "error",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/auth/login");
            });
            return;
        }

        // Function to fetch categories and vendor's products
        const fetchData = async () => {
            try {
                // Fetch product details by id
                const productResponse = await axios.get(
                    `${API_BASE_URL}/products/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const fetchedProduct = productResponse.data;
                setProduct(fetchedProduct);

                // setProductImage(fetchedProduct.productImage);
                setName(fetchedProduct.name);
                setDescription(fetchedProduct.description);
                setPrice(fetchedProduct.price);
                setSelectedCategory(fetchedProduct.CategoryId);
                setStock(fetchedProduct.stock);

                // Fetch categories
                const categoriesResponse = await axios.get(
                    `${API_BASE_URL}/categories`
                );
                // console.log("Fetched categories:", categoriesResponse.data);
                setCategories(categoriesResponse.data);
            } catch (error: any) {
                console.error(
                    "Failed to fetch product or categories:",
                    error.response?.data || error
                );
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load product or categories. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/vendor/products");
                });
            }
        };

        fetchData(); // Call the fetch function
    }, [id, navigate]); // Dependency array ensures effect runs when navigate changes

    // Function to handle editing/updating a product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token || !id) {
            return;
        }
    setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("stock", stock);
            formData.append("CategoryId", selectedCategory);
            if (productImage) {
                formData.append("productImage", productImage);
            }

            // Send PUT request to update product
            const response = await axios.put(
                `${API_BASE_URL}/products/edit/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data", // Required for file upload
                    },
                }
            );

            console.log("Update product response:", response.data);

            Swal.fire({
                title: "Success!",
                text: "Product updated successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/vendor/products");
            });
        } catch (error: any) {
            console.error("Failed to update product:", error.response?.data || error);
            Swal.fire({
                title: "Error!",
                text:
                    error.response?.data?.message ||
                    "Failed to update product. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
        finally {
        setLoading(false);
      }
    };

    if (!product) {
        return <div className="bg-gray-100 min-h-[87vh] p-8">Product not found.</div>;
    }

    if (loading) {
    return (
      <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl text-gray-600">Editing/Making changing to products...</p>
        </div>
      </div>
    );
  }

    return (
        <div>
            <Header />

            <section className="bg-gray-100 min-h-[87vh] p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Edit Product</h1>
                <p className="text-gray-600 mb-6">
                    Update the details of your product below.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <form onSubmit={handleUpdateProduct}>

                        <div className="space-y-4">
                            {/* Product Image */}
                            <div>
                                <label className="block text-gray-700">Product Image</label>

                                <img
                                    src={`${API_BASE_URL}${product.productImage}`}
                                    alt={product.name}
                                    className="rounded h-16 w-16 mb-4"
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    // value={productImage}
                                    onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                />
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Product Description */}
                            <div>
                                <label className="block text-gray-700">
                                    Product Description
                                </label>
                                <textarea
                                maxLength={200}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Product Price */}
                            <div>
                                <label className="block text-gray-700">
                                    Product Price (&#8358;)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Product Category */}
                            <div className="my-4">
                                <label htmlFor="category" className="text-gray-700">
                                    Product Category
                                </label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none "
                                    required
                                >
                                    <option value="">--- Select a category ---</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Product Stock */}
                            <div>
                                <label className="block text-gray-700">Product Stock</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                    required
                                />
                            </div>

                            {/* 'Save Changes' and 'Cancel' button */}
                            <div className="space-x-4">
                                {/* Save Changes button*/}
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-500"
                                >
                                    Save Changes
                                </button>

                                {/* Cancel button */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/vendor/products")}
                                    className="bg-red-600 text-white hover:bg-red-500 cursor-pointer px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </form>
                </div>

            </section>
        </div>
    );
};

export default EditProductPage;
