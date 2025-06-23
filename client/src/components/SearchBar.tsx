/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// A helper from the lodash library to slow down how often we ask the server for suggestions (to avoid spamming it).
import { debounce } from "lodash";
import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define Product interface to ensure type safety for product data
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

// Props interface for SearchBar component
/**
 * Specifies what the SearchBar needs from its parent (like the Header component).
onSearchResults: A way to tell the parent (e.g., Header) about all matching products when the user types.
onSelectSuggestion: A way to tell the parent when the user clicks a suggestion.
 */
interface SearchBarProps {
  onSearchResults: (results: Product[]) => void; // Callback to send search results to parent component
  onSelectSuggestion: (product: Product) => void; // Callback when a suggestion is selected
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchResults,
  onSelectSuggestion,
}) => {
  // State for the user's search input
  const [query, setQuery] = useState("");

  // For real time search suggestion
  // State to store product suggestions for the dropdown OR
  // Stores the list of products that match the user’s typing
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  // State to control whether the suggestions dropdown is visible or not
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  // State for error message
  const [errorMessage, setErrorMessage] = useState("");

  
  // To auto-clear the error message after a short delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 1000); // 1 second

      return () => clearTimeout(timer); // cleanup
    }
  }, [errorMessage]);



  // ---------------------------------->>>>>
  // Function to save search query to the database
  const saveSearchQuery = async (searchQuery: string, productId: string | null = null, vendorId: string | null = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Skip saving if user is not logged in

      // Saving to the database
      await axios.post(`${API_BASE_URL}/searched-products`,
        {
          searchQuery,
          ProductId: productId,
          VendorId: vendorId
        },
        { headers: { Authorization: `Bearer ${token}` }, }
      );
    } catch (error: any) {
      console.error("Failed to save search query:", error.response?.data || error);
    }
  };
  // ---------------------------------->>>>>



  // ---------------------------------->>>
  // Debounced function to fetch product suggestions with a delay to reduce API calls
  //   waits 0.3 seconds before asking to avoid spamming the server.
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      // If the search query is empty, clear suggestions and close dropdown
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setErrorMessage("");
        setIsDropdownOpen(false);
        onSearchResults([]); // Notify parent to clear search results
        return;
      }

      try {
        // Fetch products from the backend using the search query
        const response = await axios.get(`${API_BASE_URL}/products`, {
          params: { search: searchQuery }, // Pass search query as a parameter
        });
        // Store the filtered products from the API response
        const filteredProducts = response.data;
        console.log('API response for query', searchQuery, ':', filteredProducts);

        // Limit suggestions to the first 5 products for the dropdown
        // setSuggestions(filteredProducts.slice(0, 5));
        setSuggestions(filteredProducts);
        // Show the suggestions dropdown
        setIsDropdownOpen(true);
        // Send all matching products to the parent component
        onSearchResults(filteredProducts);
      } catch (error: any) {
        // Log any errors during the API call
        console.error(
          "Failed to fetch suggestions:",
          error.response?.data || error
        );

        // Only show error if query is 3+ characters
        if (searchQuery.trim().length >= 3) {
          setErrorMessage("Failed to fetch suggestions. Please try again.");
        }

        // setErrorMessage("Failed to fetch suggestions..");

        // Clear suggestions and hide dropdown on error
        setSuggestions([]);
        setIsDropdownOpen(false);
      }
    }, 300), // 300ms delay for debouncing
    [onSearchResults] // Dependency for useCallback
  );
  // ---------------------------------->>>


  // <<<---------------------------------->>>
  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    fetchSuggestions(searchQuery); // Fetch suggestions for the query
  };
  // <<<---------------------------------->>>


  // <<<---------------------------------->>>
  // Handle when a suggestion is clicked
  const handleSelectSuggestion = (product: Product) => {
    setQuery(product.name); // Set input to the selected product's name
    setIsDropdownOpen(false); // Hide the suggestions dropdown
    onSelectSuggestion(product); // Notify parent of the selected product
    navigate(`/products/${product.id}`); // Navigate to the product's details page
    saveSearchQuery(product.name, product.id, product.VendorId); // Save search with product details
  };
  // <<<---------------------------------->>>


  // <<<---------------------------------->>>
  // Function to handle the search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirect to ProductListingPage with search query
      // function encodeURIComponent(uriComponent: string | number | boolean): string
      // Encodes a text string as a valid component of a Uniform Resource Identifier (URI).
      // @param uriComponent — A value representing an unencoded URI component.
      saveSearchQuery(query);  // Save the general search query
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };
  // <<<---------------------------------->>>


  //   Closing Dropdown on Outside Click
  // Close the dropdown when clicking outside the search bar
  /**
   * Makes the dropdown disappear if the user clicks anywhere outside the search bar (e.g., on the page background).
   * Listens for mouse clicks on the whole page.
   * Checks if the click was outside the search bar (using the search-bar-container class).
   * Hides the dropdown if the click was outside.
   * Cleans up the listener when the component is removed to avoid memory issues.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside the search bar container
      if (!(event.target as HTMLElement).closest(".search-bar-container")) {
        setIsDropdownOpen(false); // Hide the dropdown
      }
    };
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array since this runs once


  return (
    // Container for the search bar with relative positioning for dropdown
    <div className="relative search-bar-container">
      {/* Form for handling search functionality */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-2 md:mt-0"
      >
        <div className="flex">
          {/* Input Field for searching */}
          <input
            type="text"
            placeholder="Search for anything...."
            value={query}
            onChange={handleInputChange} // Update query state
            // onChange={(e) => setQuery(e.target.value)} // Update query state
            className="rounded-l-lg shadow-sm px-4 py-2 md:w-96 bg-white text-black outline-none"
          // className="rounded-l-lg shadow-sm px-4 py-2 md:w-96 bg-gray-700 text-white outline-none"
          />
          <button
            type="submit"
            className="bg-blue-800 px-4 py-2 rounded-r-lg cursor-pointer text-white hover:bg-blue-900"
          >
            Search
            {/* <FaSearch /> */}
          </button>
        </div>
      </form>

      {/*  Error message */}
      {errorMessage && (
        <div className="text-sm text-red-600 mt-1">
          {errorMessage}
        </div>
      )}


      {/* Dropdown for search suggestions, shown only when open and suggestions exist */}
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full md:w-96 bg-white text-black shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
          {suggestions.map((productSuggestion) => (
            // Suggestion item with product image, name, and price
            <li
              key={productSuggestion.id}
              onClick={() => handleSelectSuggestion(productSuggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
            >
              {/* Product image thumbnail */}
              {/* <img
                src={`${API_BASE_URL}${productSuggestion.productImage}`}
                alt={productSuggestion.name}
                className="w-8 h-8 rounded-md object-cover"
              /> */}
              <div>
                {/* Product name */}
                <p className="text-sm font-medium">{productSuggestion.name}</p>
                {/* Product price */}
                {/* <p className="text-xs text-gray-500">{productSuggestion.price}</p> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;










// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const SearchBar = () => {

//     // State for the user's search input
//     const [query, setQuery] = useState('');

//     const navigate = useNavigate();

//     // Function to handle input change
//     const handleInputChange = (e) => {
//         const searchQuery = e.target.value;
//         setQuery(searchQuery);
//     }

//     // Function to handle the search form submission
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (query.trim()) {
//             // Redirect to ProductListingPage with search query
//             // function encodeURIComponent(uriComponent: string | number | boolean): string
//             // Encodes a text string as a valid component of a Uniform Resource Identifier (URI).
//             // @param uriComponent — A value representing an unencoded URI component.
//             navigate(`/products?search=${encodeURIComponent(query)}`);
//         }
//     };

//     return (
//         <div className="">

//             {/* Form for handling search functionality */}
//             <form
//                 onSubmit={handleSubmit}
//                 className="flex flex-col items-center mt-2 md:mt-0">
//                 <div className="flex">
//                     {/* Input Field for searching */}
//                     <input type="text"
//                         placeholder="Search for anything...."
//                         value={query}
//                         onChange={handleInputChange} // Update query state
//                         // onChange={(e) => setQuery(e.target.value)} // Update query state
//                         className="rounded-l-lg shadow-sm px-4 py-2 md:w-96 bg-white text-black outline-none"
//                         // className="rounded-l-lg shadow-sm px-4 py-2 md:w-96 bg-gray-700 text-white outline-none"
//                         />
//                     <button type="submit" className="bg-blue-950 px-4 py-2 rounded-r-lg cursor-pointer text-white hover:bg-blue-900">
//                         Search
//                     </button>
//                 </div>
//             </form>

//         </div>
//     )
// }

// export default SearchBar
