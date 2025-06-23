import { FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";


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
}

interface ProductCardInterface {
    product: Product;
}

// Define ProductHit interface for Algolia search results
interface ProductHit {
    objectID: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    productImage: string;
    VendorId: string;
}

// Type guard to check if an item is a ProductHit
const isProductHit = (item: Product | ProductHit): item is ProductHit => {
    return (item as ProductHit).objectID !== undefined;
};

const ProductCard = ({ product }: ProductCardInterface) => {
    return (
        <>
            {/* // Navigate the product details page when clicked
            // <Link to={`/products/${product.id || product.objectID}`} key={product.id}> */}

            <Link to={`/products/${isProductHit(product) ? product.objectID : product.id}`}
                key={isProductHit(product) ? product.objectID : product.id}>
                {/* Product Card */}
                <div className="bg-white p-6 rounded-lg shadow-md relative h-84 cursor-pointer hover:shadow-gray-500">

                    {/* Heart Icon */}
                    <div className="absolute top-4 right-4 bg-gray-200 w-11 h-11 rounded-full flex items-center justify-center">
                        <button className="cursor-pointer">
                            {/* <FaHeart /> */}
                            <FaRegHeart className="hover:text-red-600" />
                        </button>
                    </div>

                    {/* Product image */}
                    <img
                        src={`${API_BASE_URL}${product.productImage}`}
                        alt={product.name}
                        className="rounded-md h-40 w-full object-cover mb-4"
                    />

                    {/* Product details */}
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600"> &#8358;{product.price} </p>
                    <p className="text-gray-600">Stock: {product.stock} </p>
                    <p className="text-gray-600"> {product.description} </p>

                </div>
            </Link>
        </>

    )
}

export default ProductCard
