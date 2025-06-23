import { useState } from "react";
import { FaSearch } from "react-icons/fa"
import { useNavigate } from "react-router-dom";

const VendorSearchBar = () => {
    // State for the vendor's search input
    const [query, setQuery] = useState("");

    const navigate = useNavigate();


    // <<<---------------------------------->>>
    // Function to handle the search form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Redirect to VendorProductsPage with search query
            navigate(`/vendor/products?search=${encodeURIComponent(query)}`);
        }
    };
    // <<<---------------------------------->>>


    return (
        <div className="mb-6">

            {/* Form for handling search functionality */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col mt-2 md:mt-0">
                <div className="flex">
                    {/* Input Field for searching */}
                    <input type="text"
                        placeholder="Search for your products...."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)} // Update query state
                        className="rounded-l-lg shadow-sm px-4 py-2 md:w-96 bg-white text-blue-800 border border-blue-800 outline-none"
                    />
                    <button type="submit" className="bg-blue-800 px-4 py-2 rounded-r-lg cursor-pointer text-white hover:bg-blue-950">
                        <FaSearch />
                    </button>
                </div>
            </form>

        </div>
    )
}

export default VendorSearchBar;