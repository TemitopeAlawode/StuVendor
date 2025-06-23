import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import algoliaClient from "../utils/algoliaConfig";
import { ShieldCheckIcon, TruckIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ProductHit {
  objectID: string; // Algolia’s unique identifier for a product
  name: string;
  price: number;
  productImage: string;
}

interface Category {
  id: string;
  name: string;
}

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductHit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // <<<<---------------------------------->>>>
  // Function to display 'Featured Products'
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      // Fetching using Algolia
      try {
        const { hits } = await algoliaClient.searchSingleIndex({
          indexName: "products",
          searchParams: { hitsPerPage: 4 }
        });
        setFeaturedProducts(hits as ProductHit[]);

        // Fetch Categories
        const categoryResponse = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      }
    }

    fetchFeaturedProducts();
  }, [])
  // <<<<---------------------------------->>>>


  return (
    <div className='min-h-screen'>

      {/* Header component */}
      <Header />

      {/* Hero Section */}
      <section
        className="relative bg-gray-100 min-h-[87vh] flex items-center justify-center bg-cover bg-center"
      >

        <div className="absolute inset-0 bg-blue-950"></div>
        <div className="relative text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to StuVendor
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Connect with trusted vendors for your domestic needs. Shop for quality products or start selling today!!
          </p>

          <div className="space-x-4">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 "
            >
              Shop Now
            </Link>
            <Link
              to="/auth/signup"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-950 "
            >
              Become a Vendor
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Products Section */}
      <section className='bg-white py-10'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Featured Products
        </h2>
          {/* Featured Products List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.objectID}
                to={`/products/${product.objectID}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <img
                  src={`${API_BASE_URL}${product.productImage}`}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  {/* Product Price */}
                  <p className="text-green-600 font-medium">
                    &#8358;{product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Products &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why Shop with StuVendor?/ Value Propositions Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Shop with StuVendor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <ShieldCheckIcon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Trusted Vendors</h3>
              <p className="text-gray-600">
                Shop from verified vendors offering quality products.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <TruckIcon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your orders quickly with reliable delivery.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <UserPlusIcon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Signup</h3>
              <p className="text-gray-600">
                Join as a buyer or vendor in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section*/}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Explore Categories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse All Categories &rarr;
            </Link>
          </div>

        </div>
      </section>


      {/* Footer Component */}
      <Footer />

    </div>
  )
}

export default HomePage




















// import { Link } from 'react-router-dom';
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// // import  image  from '../assets/images/pexels-karolina-grabowska-5632371.jpg'

// const HomePage = () => {
//   return (
//     <div className='min-h-screen'>

//       {/* Header component */}
//       <Header />

//       {/* Main content */}
//       <section className='bg-gray-100 min-h-[87vh] flex flex-col items-center justify-center'>

//         {/* <img src={image} alt="" className='object-cover'/> */}

//         <h1 className='text-4xl font-bold pb-4 text-gray-800'>Welcome to StuVendor</h1>
//         <p className='text-lg text-gray-600 pb-6 text-center'>Connect with vendors for your domestic needs, view available products or start selling as a vendor today!!</p>

//         <div className='space-x-4'>
//           <Link
//             // to="/auth/signup"
//             to="/products"
//             className='bg-blue-950 text-white px-6 py-3 rounded hover:bg-blue-900'
//           >
//             Get Started
//           </Link>
//           {/* <Link to="/vendors/create-vendor-profile" */}
//           <Link to="/auth/signup"
//             className='bg-blue-800 text-white px-6 py-3 rounded hover:bg-blue-700'
//           >
//             Become a Vendor
//           </Link>
//         </div>

//       </section>

//       {/* Footer Component */}
//       <Footer />

//     </div>
//   )
// }

// export default HomePage
