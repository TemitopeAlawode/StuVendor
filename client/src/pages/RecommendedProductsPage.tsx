/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { useCount } from '../contexts/CountContext';

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

const RecommendedProductsPage = () => {
  const navigate = useNavigate();
  const { updateCounts } = useCount();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  // ---------------------------------->>>>
  // Fetch liked products
  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/liked-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(response.data.likedProducts)
          ? response.data.likedProducts
          : [];
        setLikedProducts(data.map((item: any) => item.ProductId));
      } catch (error: any) {
        console.error('Failed to fetch liked products:', error);
      }
    };

    fetchLikedProducts();
  }, []);
  // ---------------------------------->>>>


  // ---------------------------------->>>>
  // Fetch recommended products
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            title: 'Please Log In',
            text: 'You need to log in to view recommendations.',
            icon: 'warning',
            confirmButtonText: 'OK',
          }).then(() => navigate('/auth/login'));
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/recommended-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendedProducts(response.data.recommendedProducts || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          Swal.fire({
            title: 'Session Expired',
            text: 'Please log in again.',
            icon: 'warning',
            confirmButtonText: 'OK',
          }).then(() => navigate('/auth/login'));
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to load recommendations.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    };

    fetchRecommendations();
  }, [navigate]);
  // ---------------------------------->>>>


  // ---------------------------------->>>>
  // Handle like/unlike button click
  const handleLikeClick = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          title: 'Login Required',
          text: 'Please log in to like products.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        navigate('/auth/login');
        return;
      }

      if (likedProducts.includes(productId)) {
        await axios.delete(`${API_BASE_URL}/liked-products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedProducts(likedProducts.filter((id) => id !== productId));
        updateCounts();
        Swal.fire({
          title: 'Success',
          text: 'Product unliked.',
          icon: 'success',
          timer: 1500,
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/liked-products`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedProducts([...likedProducts, productId]);
        updateCounts();
        Swal.fire({
          title: 'Success',
          text: 'Product liked successfully!',
          icon: 'success',
          timer: 1500,
        });
      }
    } catch (error: any) {
      console.error('Failed to like/unlike product:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to like/unlike product.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  // ---------------------------------->>>>


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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <section className="flex-grow p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-800">Recommended Products</h1>
            </div>
            <Link
              to="/products"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors"
            >
              Browse All Products
            </Link>
          </div>

          <p className="text-gray-600 mb-6">
            Discover products tailored for you based on your interests.
          </p>

          {recommendedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-4">
                No recommendations available yet.
              </p>
              <Link
                to="/products"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Products to Get Started
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300"
                >
                    <Link
                      to={`/products/${product.id}`}
                      >
                  <div className="relative">
                    <img
                      src={`${API_BASE_URL}${product.productImage}`}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 bg-gray-200 w-11 h-11 rounded-full flex items-center cursor-pointer justify-center hover:bg-gray-300 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLikeClick(product.id);
                      }}
                    >
                      {likedProducts.includes(product.id) ? (
                        <FaHeart className="text-red-600" />
                      ) : (
                        <FaRegHeart className="text-gray-600 hover:text-red-600" />
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-2">&#8358;{product.price}</p>
                    {/* <p className="text-gray-600 mb-2">&#8358;{product.price.toFixed(2)}</p> */}
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {product.description || 'No description available.'}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default RecommendedProductsPage;




// Initials - TAD
// September 2025












// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// interface Product {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   VendorId: string;
//   CategoryId: string;
//   stock: number;
//   productImage: string;
// }

// const RecommendedProductsPage = () => {
//   const navigate = useNavigate();
//   const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRecommendations = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           Swal.fire({
//             title: 'Please Log In',
//             text: 'You need to log in to view recommendations.',
//             icon: 'warning',
//             confirmButtonText: 'OK',
//           }).then(() => navigate('/auth/login'));
//           return;
//         }

//         const response = await axios.get(`${API_BASE_URL}/api/recommended-products`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log('Recommendations:', response.data);
//         setRecommendedProducts(response.data.recommendedProducts);
//         setLoading(false);
//       } catch (error: any) {
//         console.error('Error fetching recommendations:', error);
//         setLoading(false);
//         if (error.response?.status === 401) {
//           localStorage.removeItem('token');
//           Swal.fire({
//             title: 'Session Expired',
//             text: 'Please log in again.',
//             icon: 'warning',
//             confirmButtonText: 'OK',
//           }).then(() => navigate('/auth/login'));
//         } else {
//           Swal.fire({
//             title: 'Error',
//             text: 'Failed to load recommendations.',
//             icon: 'error',
//             confirmButtonText: 'OK',
//           });
//         }
//       }
//     };

//     fetchRecommendations();
//   }, [navigate]);

//   if (loading) {
//     return <div className="text-center p-5">Loading recommendations...</div>;
//   }

//   return (
//     <div className="container mx-auto p-5">
//       <h1 className="text-3xl font-bold mb-6">Recommended Products</h1>
//       {recommendedProducts.length === 0 ? (
//         <p className="text-center text-gray-500">
//           No recommendations available. Browse products to get personalized suggestions!
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {recommendedProducts.map((product) => (
//             <div
//               key={product.id}
//               className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//             >
//               <img
//                src={`${API_BASE_URL}${product.productImage}`}
//                 alt={product.name}
//                 className="w-full h-48 object-cover"
//               />
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
//                 <p className="text-gray-600 mb-2">${product.price}</p>
//                 {/* <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p> */}
//                 <Link
//                   to={`/products/${product.id}`}
//                   className="text-blue-600 hover:underline"
//                 >
//                   View Details
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecommendedProductsPage;