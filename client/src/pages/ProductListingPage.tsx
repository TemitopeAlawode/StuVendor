/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Footer from "../components/Footer";
import algoliaClient from "../utils/algoliaConfig";
import BackButton from "../components/BackButton";

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

// Define Category interface for type safety
interface Category {
  id: string;
  name: string;
}

// Define ProductHit interface for Algolia search results
interface ProductHit {
  objectID: string; // Algolia’s unique identifier for a product
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  productImage: string;
  VendorId: string;
}

// Define LikedProduct interface
interface LikedProduct {
  ProductId: string;
  UserId: string;
  VendorId: string;
  likeTimestamp: string;
  Product: Product;
}

// Type guard to check if an item is a ProductHit
// Type guard to check if an item is a ProductHit (from Algolia) vs. a Product
const isProductHit = (item: Product | ProductHit): item is ProductHit => {
  return (item as ProductHit).objectID !== undefined;
};

const ProductListingPage = () => {
  // State to store list of products (can be Product or ProductHit)
  // const [products, setProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<(Product | ProductHit)[]>([]);
  // State to store categories for the filter dropdown
  const [categories, setCategories] = useState<Category[]>([]);
  // State to track the selected category for filtering
  const [selectedCategory, setSelectedCategory] = useState("");

  // State to show a loading spinner while fetching data
  const [loading, setLoading] = useState(true);
  // State to store error messages, if any
  const [error, setError] = useState<string | null>(null);

  // State to track IDs of products liked by the user
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

   // Use context for updating count
    const { updateCounts } = useCount(); 

  const navigate = useNavigate();
  // Decoding the search input
  // Hook to get search query from URL (e.g. ?search=phone)
  const [searchParams] = useSearchParams();
  // Extract search query or category or default to empty string
  const searchQuery = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || ""; // Read category from URL

   useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // ---------------------------------->>
  // Fetch liked products on component mount
  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/liked-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Access the likedProducts property and ensure it’s an array
        // Ensure response data is an array (backend returns { likedProducts: [...] })
        const data = Array.isArray(response.data.likedProducts)
          ? response.data.likedProducts
          : []; // Default to empty array if not an array
        // Extract ProductId from each liked product
        const likedProductIds = data.map((item: LikedProduct) => item.ProductId);
        // Update state with liked product IDs
        setLikedProducts(likedProductIds);
      } catch (error: any) {
        console.error("Failed to fetch liked products:", error.response?.data || error);
      }
    };

    fetchLikedProducts(); // Run the fetch function
  }, []);
  // ---------------------------------->>



  // ---------------------------------->>>>
  // Fetch products and categories when search query or selected category changes
  useEffect(() => {
    const fetchData = async () => {
      // Show loading spinner
      setLoading(true);
      // Clear any previous errors
      setError(null);

      try {
        // Fetch categories (needed for the filter by category dropdown)
        const categoriesResponse = await axios.get(
          `${API_BASE_URL}/categories`
        );
        console.log("Fetched categories:", categoriesResponse.data);
        setCategories(categoriesResponse.data);

        // If a category is selected, fetch products for that category (ignore search query)
        if (selectedCategory) {
          const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
            params: { categoryId: selectedCategory },
          });
          console.log("Fetched products:", productsResponse.data);
          setProducts(productsResponse.data); // Update state with fetched products
        }
        // If there's a searchQuery/input and no category is selected, use Algolia search
        else if (searchQuery) {
          // Perform Algolia search with the query
          // Fetch Algolia search results
          const { hits } = await algoliaClient.searchSingleIndex({
            indexName: "products", // Search in the 'products' index
            searchParams: {
              query: searchQuery,
              typoTolerance: false,
               hitsPerPage: 20
            },
          });
          setProducts(hits as ProductHit[]); // Update products with search results
        }
        // Otherwise, fetch all products
        else {
          // Fetch all products
          const productsResponse = await axios.get(
            `${API_BASE_URL}/products`
            // { params: { categoryId: selectedCategory }}
          );
          console.log("Fetched all products:", productsResponse.data);
          setProducts(productsResponse.data); // Update state with fetched products
        }
      } catch (error: any) {
        console.error("Failed to fetch data:", error.response?.data || error);
        Swal.fire({
          title: "Notice!",
          text: selectedCategory
            ? "No products available under this category."
            : searchQuery
              ? `No search results found for '${searchQuery}'`
              : "No products available.",
          icon: "info",
          confirmButtonText: "OK",
        });
        setProducts([]); // Clears products when there's an error
      } finally {
        // Hide loading spinner
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, selectedCategory]); // Refetch products when selectedCategory changes
  // ---------------------------------->>>>


  // Handle category filter change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Update URL to reflect category selection
      navigate( categoryId
        ? `/products?category=${categoryId}` 
        : "/products"
        // { replace: true }
      ); 
  };


  // ---------------------------------->>
  // Function to Handle like/unlike button click
  const handleLikeClick = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Login Required",
          text: "Please log in to like products.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        navigate("/auth/login");
        return;
      }

      if (likedProducts.includes(productId)) {
        // Unlike product
        // If product is already liked, unlike it
        await axios.delete(`${API_BASE_URL}/liked-products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Remove productId from likedProducts state
        // filter() goes through each item (id) in the likedProducts array.
        // It keeps only the items that are not equal to productId.
        // This effectively removes the given productId from the list.
        setLikedProducts(likedProducts.filter((id) => id !== productId));
        
        // Refresh counts
        await updateCounts(); 

        Swal.fire({
          title: "Success",
          text: "Product unliked.",
          icon: "success",
          timer: 1500, // Auto-close after 1.5 seconds
        });
      } else {
        // Like product
        // const response = await axios.post(`${API_BASE_URL}/liked-products`,
        await axios.post(`${API_BASE_URL}/liked-products`,
          { productId }, // Send productId in request body
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedProducts([...likedProducts, productId]);
        // setLikedProducts([...likedProducts, response.data.productId]);
        
        // Refresh counts
        await updateCounts(); 

        Swal.fire({
          title: "Success",
          text: "Product liked successfully!",
          icon: "success",
          timer: 1500, // Auto-close after 1.5 seconds
        });
      }
    } catch (error: any) {
      console.error("Failed to like/unlike product:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to like/unlike product.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
  // ---------------------------------->>


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

  // Determine the category name for the heading
  // Get the name of the selected category to display as a heading.
  /**
   * categories is an array of category objects.
   * selectedCategory is the ID (string) of the category the user selected.
   * .find(...) searches the categories array for a category whose id matches selectedCategory.
   * ?.name uses optional chaining to safely access the name property only if a matching category is found.
   *  || '' provides a fallback empty string if no match is found (i.e., if find(...) returns undefined).
   */
  const selectedCategoryName =
    categories.find((categoryName) => categoryName.id === selectedCategory)
      ?.name || "";

  return (
    <div>
      {/* Header component */}
      <Header />

      {/* Main content */}
      <section className="bg-gray-100 min-h-[87vh] p-8">

        <div className="flex items-center justify-between mb-10">
          
          <div className="flex items-center space-x-4">
          {/* Button for navigating back to previous page*/}
          <BackButton />

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedCategoryName
              ? `Products in '${selectedCategoryName}' category`
              : searchQuery
                ? `Search Results for '${searchQuery}' `
                : "Browse Products"}
          </h1>
          </div>

          <button
            onClick={() => navigate('/recommended-products')}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-900 transition-colors"
            // className=" border border-blue-600 text-blue-600 font-medium px-4 py-2 rounded cursor-pointer transition-colors hover:bg-gray-200"
            >
            View Recommended Products
          </button>

        </div>

        {/* Sub-heading */}
        <p className="text-gray-600 mb-6">
          {selectedCategoryName
            ? `Explore products in '${selectedCategoryName}' category below`
            : searchQuery
              ? "Showing search results..."
              : "Explore all available products below."}
        </p>

        {/* Category Filter dropdown */}
        <div className="mb-6">
          <label htmlFor="categoryFilter" className="text-gray-700 pr-2">
            Filter by Category:
          </label>

          <select
            id="categoryFilter"
            value={selectedCategory}
            // onChange={(e) => setSelectedCategory(e.target.value)}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <p className="text-gray-600">No products available.</p>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const productId = isProductHit(product) ? product.objectID : product.id;
              // Checks to see the products that has been liked.
              const isLiked = likedProducts.includes(productId);

              return (

                // Navigate the product details page when clicked
                // <Link to={`/products/${product.id || product.objectID}`} key={product.id}>
                <div key={productId}>
                  {/* Link to product details page */}
                  <Link
                    to={`/products/${productId}`}
                  >
                    {/* Product Card */}
                    <div 
                    className="bg-white rounded-lg shadow-md relative cursor-pointer hover:shadow-gray-500"
                  // className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300"
                    >
                      {/* Like/unlike button with heart icon */}
                      <div className="absolute top-1 right-1 bg-gray-200 w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors group">
                        <button
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault() // prevent link navigation
                            handleLikeClick(productId) // Handle like/unlike
                          }}
                        >
                          {isLiked ? (
                            <FaHeart className="text-red-600" />
                          ) : (
                            <FaRegHeart className="hover:text-red-600" />
                          )}
                          {/* <FaRegHeart className="group-hover:hidden" /> 
                       <FaHeart className="text-red-600 hidden group-hover:block" /> */}
                        </button>
                      </div>

                      {/* Product image */}
                      <img
                        src={`${API_BASE_URL}${product.productImage}`}
                        alt={product.name}
                        className="rounded-t-md h-48 w-full object-cover mb-4"
                      />

                  <div className="p-4">
                      {/* Product details */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-2"> &#8358;{product.price} </p>
                      {/* <p className="text-gray-600">Stock: {product.stock} </p> */}
                      <p className="text-gray-600 text-sm mb-2"> {product.description} </p>

                       <Link
                      to={`/products/${productId}`}
                      className="inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    </div>
                    </div>
                    {/* End of Product Card */}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        {/* End of Products Grid/List */}
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default ProductListingPage;


