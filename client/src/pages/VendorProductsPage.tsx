/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react"
import Header from "../components/Header"
import { useNavigate, useSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import axios from "axios"; // Import axios for HTTP requests
import Footer from "../components/Footer";
import VendorSearchBar from "../components/VendorSearchBar";
import algoliaClient from '../utils/algoliaConfig';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define Product interface for type safety
interface Product {
  id: string // UUID is a string
  name: string
  description?: string // this should probably be optional
  price: number
  VendorId: string
  CategoryId: string
  stock: number
  productImage: string
  createdAt: string
}

// Define Category interface for type safety
interface Category {
  id: string
  name: string
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

// Type guard to check if an item is a ProductHit
// Type guard to check if an item is a ProductHit (from Algolia) vs. a Product
const isProductHit = (item: Product | ProductHit): item is ProductHit => {
  return (item as ProductHit).objectID !== undefined;
};


// VendorProductsPage component to display and manage vendor products
const VendorProductsPage = () => {
  // State to store list of products
  // const [products, setProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<(Product | ProductHit)[]>([]);

  // State to display 'Add Product' form
  // State to toggle 'Add Product' form visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // State for the add product form fields
  const [productImage, setProductImage] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // State for categories and selected category
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // For Loading..
  const [loading, setLoading] = useState(true);

  // Hook to navigate to other routes
  const navigate = useNavigate();

  // Decoding the search input
  // Hook to get search query from URL (e.g. ?search=phone)
  const [searchParams] = useSearchParams();
  // Extract search query or default to empty string
  const searchQuery = searchParams.get("search") || "";


  // <<<---------------------------------->>>
  // Effect to check authentication and fetch data on component/page mount
  useEffect(() => {
    setLoading(true);
    // Get JWT token from local storage
    const token = localStorage.getItem("token");
    // If no token, show error and redirect to login
    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "You must be logged as a vendor in to manage products..",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/auth/login");
      });
      return;
    };

    // ---------------------------------->>>
    // Function to fetch categories and vendor's products  
    const fetchData = async () => {
      try {
        // Fetch vendor profile to get VendorId
        const vendorResponse = await axios.get(`${API_BASE_URL}/vendors/vendor-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vendorId = vendorResponse.data.id;
        console.log('Vendor Id: ', vendorId);

        // Fetch all categories
        const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
        console.log("Fetched categories:", categoriesResponse.data);
        setCategories(categoriesResponse.data);

        // If there's a searchQuery/input, use Algolia search
        if (searchQuery) {
          // Perform Algolia search with the query
          // Fetch Algolia search results filtered by VendorId
          const { hits } = await algoliaClient.searchSingleIndex({
            indexName: "products",
            searchParams: {
              query: searchQuery,
              filters: `VendorId:${vendorId}`, // Filter by VendorId
              typoTolerance: false,
              // filters: `VendorId:"${vendorId}"`,
              hitsPerPage: 20
            },
          });
          setProducts(hits as ProductHit[]);
        }
        // Otherwise, fetch all vendor's products
        else {
          // Fetch vendor's products from the backend using the endpoint for fetching products by vendor id
          const productsResponse = await axios.get(`${API_BASE_URL}/products/vendor/${vendorId}`, {
            headers: { Authorization: `Bearer ${token}` }, // Include token in request headers
          });
          console.log("Fetched products:", productsResponse.data);
          setProducts(productsResponse.data); // Update state with fetched products

        }
      } catch (error: any) {
        // Log error for debugging
        console.error("Failed to fetch products:", error.response?.data || error);
        // Handle 404 error (no products found)
        if (error.response?.status === 404) {
          Swal.fire({
            title: "Notice!",
            text: searchQuery
              ? `No search results found for '${searchQuery}'`
              : "No products found for this vendor. Add a product to get started!",
            icon: "info",
            confirmButtonText: "OK",
          });
        } else {
          // Handle other errors
          Swal.fire({
            title: "Error!",
            text: "Failed to load products. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
        setProducts([]); // Clears products when there's an error
      }
      finally {
        setLoading(false);
      }
    }
    // ---------------------------------->>>

    fetchData(); // Call the fetch function

  }, [navigate, searchQuery]); // Dependency array ensures effect runs when navigate and searchQuery changes
  // <<<---------------------------------->>>


  // <<<---------------------------------->>>
  // Function to handle adding a new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    try {
      // Using FormData to handle file upload and form fields
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("CategoryId", selectedCategory);
      if (productImage) {
        formData.append("productImage", productImage);
      }

      // Send POST request to add product
      const response = await axios.post(`${API_BASE_URL}/products/add-product`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" // Required for file upload
        },
      });

      console.log("Add product response:", response.data);

      // Add the new product to the products list
      setProducts([...products, response.data.product]);
      // setProducts([...products, response.data]);

      // Reset form and hide form
      setProductImage(null);
      setName("");
      setDescription("");
      setPrice("");
      setSelectedCategory("");
      setStock("");
      setShowAddForm(false);

      // Show Success message alert
      Swal.fire({
        title: "Success!",
        text: "Product added successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error: any) {
      // Log error
      console.error("Failed to add product:", error.response?.data || error);
      // Show error alert
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add product. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  // <<<---------------------------------->>>


  // <<<---------------------------------->>>
  // Function to handle adding deleting a product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    // Show confirmation dialog before deleting
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${productName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    } // Exit if user cancels
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    } // Exit if no token
    try {
      // Send DELETE request to remove product
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Deleted Product: ', response.data);

      // Updating the remaining products to be displayed and filtering out/removing the just deleted product by confirming the id
      // Remove deleted product from state
      setProducts(products.filter((p) => (isProductHit(p) ? p.objectID : p.id) !== productId));
      // Show success alert
      Swal.fire({
        title: "Success!",
        text: "Product deleted successfully!",
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

  };
  // <<<---------------------------------->>>


  // <<<---------------------------------->>>
  // Handle Back button with confirmation if form is active
  const handleBack = () => {
    if (showAddForm && (name || description || price || stock || selectedCategory || productImage)) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes in the Add Product form. Are you sure you want to leave?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Leave',
        cancelButtonText: 'No, Stay',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(-1); // Go back to the previous page
        }
      });
    }
    // Else if the 'Add product form' isn't open and filled up
    else {
      navigate(-1); // Go back to the previous page
    }
  };
  // <<<---------------------------------->>>


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

    <div>
      {/* Header component */}
      <Header />

      {/* Main section for displaying products */}
      <section className='bg-gray-100 min-h-[87vh] p-8'>

        {/* SearchBar for vendors to search for their products */}
        <VendorSearchBar />

        {/* Div for 'Back' , 'Your Products' heading, 'Add product button' */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center space-x-4">
            {/* Button for navigating back to previous page*/}

            {/* <Link to={"/vendor-dashboard"} */}
            <button
              className="bg-gray-300 font-medium text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
              onClick={handleBack}
            >
              &larr; Back
            </button>
            {/* </Link> */}
            <h1 className="text-3xl font-bold text-gray-800">Your Products</h1>

          </div>

          {/* Add New Product/Cancel Button */}
          {/* Toggle between Add New Product and Cancel buttons */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900">
              Add New Product
            </button>
          ) : (
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-red-600 text-white hover:bg-red-500 cursor-pointer px-4 py-2 rounded">
              Cancel
            </button>
          )
          }

        </div>

        <p className="text-gray-600 mb-6">
          {searchQuery ? `Showing search results for '${searchQuery}'...` : "View and manage your listed products here."}
        </p>


        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

            <form
              onSubmit={handleAddProduct}
            >
              <div className="space-y-4">
                {/* Product Image */}
                <div>
                  <label className="block text-gray-700">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    // value={productImage}
                    onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                    required
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
                  <label className="block text-gray-700">Product Description</label>
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
                  <label className="block text-gray-700">Product Price (&#8358;)</label>
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
                      <option key={category.id} value={category.id}>{category.name}</option>
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

                {/* Add Product Submit button */}
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-500">
                  Add Product
                </button>

              </div>
            </form>

          </div>
        )}

        {/* Conditionally render products list based on products availability */}
        {products.length === 0 ? (
          <p className="text-gray-600">No products found. Add a product to get started!</p>
        ) : (
          // Render list of products
          <div className="space-y-4">
            {products.map((product) => (

              // Display individual product details
              <div
                key={isProductHit(product) ? product.objectID : product.id}
                className="bg-white p-6 rounded-lg flex shadow-md mb-6">

                {/* Product image */}
                <img src={`${API_BASE_URL}${product.productImage}`} alt={product.name}
                  // className="rounded h-16 w-16"
                  className="rounded h-20 w-20"
                // onError={(e) => console.log("Image failed to load:", `${API_BASE_URL}${product.productImage}`)}
                />

                {/* Product details */}
                <div className="ml-4 flex-1">
                  <p> <strong> {product.name}</strong> - &#8358;{product.price} </p>
                  <p className="text-gray-600">Stock: {product.stock} </p>
                  <p className="text-gray-600"> {product.description} </p>
                  {/* <p className="text-gray-600"><strong>Date Of Creation: </strong>{product.createdAt} </p> */}
                </div>

                {/* Action buttons */}
                <div className="space-x-4 items-center flex">
                  <button
                    onClick={() => navigate(`/vendor/products/edit/${isProductHit(product) ? product.objectID : product.id}`)}
                    className="bg-blue-950 text-white px-3 py-2 rounded hover:bg-blue-900 cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteProduct(
                        isProductHit(product) ? product.objectID : product.id,
                        product.name)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-500 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* Footer Component */}
      <Footer />

    </div>
  )

}

export default VendorProductsPage
