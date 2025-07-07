/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import axios from "axios"
import React from "react"

interface CartProduct {
    VendorId: string;
    ProductId: string;
    price: number;
    quantity: number;
}

interface Order {
    id?: string;
    UserId: string;
    totalAmount: number;
    shippingAddress: string;
    transactionId: string;
    orderStatus: string;
    orderDate: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    Products: CartProduct[];
}

interface Product {
    id: string;
    name: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const VendorOrdersPage = () => {

    // Defining states
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<{ [key: string]: Product }>({}); //cache products details 
    const [balance, setBalance] = useState('0.00');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const[isWithdrawing, setIsWithdrawing] = useState(false);

    const navigate = useNavigate();

// <<<<<----------------------->>>>>
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: "Error!",
                text: "You must be logged in to access the vendor orders page.",
                icon: "error",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/auth/login");
            });
            return;
        }

        const fetchVendorData = async () => {
            try {
                // Fetch vendor balance
                const balanceResponse = await axios.get(`${API_BASE_URL}/vendors/balance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Parse balance to number and format with commas
                const balanceValue = parseFloat(balanceResponse.data.balance || '0.00');
                setBalance(balanceValue.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                // setBalance(balanceResponse.data.balance || '0.00');

                /**
                *Step	What's Happening
                1.	Fetch the vendor's orders.
                2.	Extract unique product IDs used across all those orders.
                3.	Fetch product details for each ID (in parallel).
                4.	Combine results into a fast-access product map.
                5.	Save it in state for display or logic use.
                 */

                // Fetch vendor orders
                const ordersResponse = await axios.get(`${API_BASE_URL}/vendors/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetchedOrders = ordersResponse.data;
                setOrders(fetchedOrders);

                // Extract all product IDs
                /**
                * flatMap: Gets all product IDs across all orders (flattens the nested arrays).
                Set: Removes duplicates so you don't fetch the same product twice.
                ... Converts the Set back into an array.
                 Result: productIds = ["prod1", "prod2", "prod3", ...]
                */
                const productIds = [
                    ...new Set(
                        fetchedOrders.flatMap((order: Order) =>
                            order.Products.map((p: CartProduct) => p.ProductId)
                        )
                    ),
                ];

                // Make product requests / Fetch the full product details.
                const productPromises = productIds.map((id) =>
                    axios.get(`${API_BASE_URL}/products/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );

                // Wait for all requests
                /**
                 * This line runs all requests in parallel.
productResponses is now an array of responses like:
[{ data: { id: 'prod1', name: 'Milo' } }, { data: { id: 'prod2', name: 'Cornflakes' } }]
                 */

                const productResponses = await Promise.all(productPromises);

                //  Build a product map
                // converting the array of product responses into an object for fast lookup by product ID.
                const productMap = productResponses.reduce((acc: { [key: string]: Product }, response) => {
                    const product = response.data;
                    acc[product.id] = product;
                    return acc;
                }, {});

                //  Save product map to state
                setProducts(productMap);
            } catch (error: any) {
                console.error("Failed to fetch vendor data:", error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to load orders. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }

        fetchVendorData();
    }, [navigate]);
// <<<<<----------------------->>>>>


// <<<<<----------------------->>>>>
// Handle Withdrawal
const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                Swal.fire({
                    title: "Error!",
                    text: "Please enter a valid amount.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }

             setIsWithdrawing(true);
            try {
                 const token = localStorage.getItem("token");
            const response = await axios.post(
            //  await axios.post(
                `${API_BASE_URL}/vendors/withdraw`,
                { amount: withdrawAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBalance(response.data.balance);
            setWithdrawAmount("");
            setShowWithdrawalModal(false);
            Swal.fire({
                title: "Success!",
                text: "Withdrawal request processed successfully.",
                icon: "success",
                confirmButtonText: "OK",
            });
            } catch (error: any) {
                 console.error("Withdrawal error:", error.response?.data || error);
                 Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to process withdrawal.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } finally {
            setIsWithdrawing(false);
        }
}
// <<<<<----------------------->>>>>



return (
        <div className="min-h-screen flex flex-col">
            {/* Header component */}
            <Header />

            <section className="flex-grow bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-4">
                            <BackButton />
                            <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
                        </div>
                        <button
                            onClick={() => navigate('/vendor-dashboard')}
                            className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6">View your orders and manage your balance.</p>

                    <div className="space-y-6">
                        {/* Balance Section */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Your Balance</h2>
                            <p className="text-2xl font-bold text-gray-800">
                                &#8358;{balance.toLocaleString()}
                            </p>
                            <button
                                onClick={() => setShowWithdrawalModal(true)}
                                className="bg-green-600 px-4 py-2 text-white font-semibold rounded mt-4 cursor-pointer hover:bg-green-500"
                            >
                                Withdraw
                            </button>
                        </div>
                        {/* Orders Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="px-4 py-2">Customer</th>
                                            <th className="px-4 py-2">Product</th>
                                            <th className="px-4 py-2">Price</th>
                                            <th className="px-4 py-2">Quantity</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2">Delivery Address</th>
                                            <th className="px-4 py-2">Phone Number</th>
                                            <th className="px-4 py-2">Email Address</th>
                                            <th className="px-4 py-2">Order Status</th>
                                            <th className="px-4 py-2">Order Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
                                                    No orders found.
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <React.Fragment key={order.id}>
                                                    {order.Products.map((product, index) => (
                                                        <tr key={`${order.id}-${product.ProductId}`} className="">
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? order.customerName : ""}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {products[product.ProductId]?.name}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                &#8358;{product.price.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {product.quantity}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                &#8358;{(product.price * product.quantity).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? order.shippingAddress : ""}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? order.customerPhone : ""}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? order.customerEmail : ""}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? order.orderStatus : ""}
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {index === 0 ? new Date(order.orderDate).toLocaleDateString() : ""}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Separator after each order */}
                                                    <tr>
                                                        <td colSpan={10}>
                                                            <hr className="my-2 border-t border-gray-400" />
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>



                        </div>

                    </div>
                </div>

            </section>

                {/* Withdrawal Modal */}
{showWithdrawalModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                            <h2 className="text-lg sm:text-xl font-semibold mb-4">Withdraw Funds</h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-4">
                                Available Balance: &#8358;{balance}
                            </p>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Enter amount to withdraw"
                                className="w-full p-2 border rounded mb-4 text-sm sm:text-base"
                                min="0"
                                step="0.01"
                            />
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button
                                    onClick={() => {
                                        setWithdrawAmount("");
                                        setShowWithdrawalModal(false);
                                    }}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                                disabled={isWithdrawing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors"
                                disabled={isWithdrawing}
                                >
                                    {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
                                </button>
                            </div>
                        </div>
                    </div>
)}

            {/* Footer component */}
            <Footer />
        </div>
    )
}

export default VendorOrdersPage







/**
 *          ) : (
                                orders.flatMap((order) =>
                                order.Products.map((product) => (
                                    <tr key={`${order.id}-${product.ProductId}`} className="border-b">
                                        <td className="px-4 py-2 text-center">
                                            {order.customerName}
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            { products[product.ProductId]?.name }
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            &#8358;{ product.price.toFixed(2) }
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            { product.quantity }
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            &#8358;{ (product.price * product.quantity).toFixed(2) }
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            {order.shippingAddress}
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            { order.orderStatus }
                                            </td>
                                        <td className="px-4 py-2 text-center">
                                            { new Date(order.orderDate).toLocaleDateString() }
                                            </td>
                                    </tr>
                                ))
                                    )
                                )}
 */














// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useNavigate } from "react-router-dom"
// import BackButton from "../components/BackButton"
// import Footer from "../components/Footer"
// import Header from "../components/Header"
// import { useEffect, useState } from "react"
// import Swal from "sweetalert2"
// import axios from "axios"
// import React from "react"

// interface CartProduct {
//     VendorId: string;
//     ProductId: string;
//     price: number;
//     quantity: number;
// }

// interface Order {
//     id?: string;
//     UserId: string;
//     totalAmount: number;
//     shippingAddress: string;
//     transactionId: string;
//     orderStatus: string;
//     orderDate: Date;
//     customerName: string;
//     customerEmail: string;
//     customerPhone: string;
//     Products: CartProduct[];
// }

// interface Product {
//     id: string;
//     name: string;
// }

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// const VendorOrdersPage = () => {

//     // Defining states
//     const [orders, setOrders] = useState<Order[]>([]);
//     const [products, setProducts] = useState<{ [key: string]: Product }>({}); //cache products details
//     const [balance, setBalance] = useState('0.00');

//     const navigate = useNavigate();


//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (!token) {
//             Swal.fire({
//                 title: "Error!",
//                 text: "You must be logged in to access the vendor orders page.",
//                 icon: "error",
//                 confirmButtonText: "OK",
//             }).then(() => {
//                 navigate("/auth/login");
//             });
//             return;
//         }

//         const fetchVendorData = async () => {
//             try {
//                 // Fetch vendor balance
//                 const balanceResponse = await axios.get(`${API_BASE_URL}/vendors/balance`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 // Parse balance to number and format with commas
//                 const balanceValue = parseFloat(balanceResponse.data.balance || '0.00');
//                 setBalance(balanceValue.toLocaleString('en-NG', {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2
//                 }));
//                 // setBalance(balanceResponse.data.balance || '0.00');

//                 /**
//                 *Step	What's Happening
//                 1.	Fetch the vendor's orders.
//                 2.	Extract unique product IDs used across all those orders.
//                 3.	Fetch product details for each ID (in parallel).
//                 4.	Combine results into a fast-access product map.
//                 5.	Save it in state for display or logic use.
//                  */

//                 // Fetch vendor orders
//                 const ordersResponse = await axios.get(`${API_BASE_URL}/vendors/orders`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const fetchedOrders = ordersResponse.data;
//                 setOrders(fetchedOrders);

//                 // Extract all product IDs
//                 /**
//                 * flatMap: Gets all product IDs across all orders (flattens the nested arrays).
//                 Set: Removes duplicates so you don't fetch the same product twice.
//                 ... Converts the Set back into an array.
//                  Result: productIds = ["prod1", "prod2", "prod3", ...]
//                 */
//                 const productIds = [
//                     ...new Set(
//                         fetchedOrders.flatMap((order: Order) =>
//                             order.Products.map((p: CartProduct) => p.ProductId)
//                         )
//                     ),
//                 ];

//                 // Make product requests / Fetch the full product details.
//                 const productPromises = productIds.map((id) =>
//                     axios.get(`${API_BASE_URL}/products/${id}`, {
//                         headers: { Authorization: `Bearer ${token}` },
//                     })
//                 );

//                 // Wait for all requests
//                 /**
//                  * This line runs all requests in parallel.
// productResponses is now an array of responses like:
// [{ data: { id: 'prod1', name: 'Milo' } }, { data: { id: 'prod2', name: 'Cornflakes' } }]
//                  */

//                 const productResponses = await Promise.all(productPromises);

//                 //  Build a product map
//                 // converting the array of product responses into an object for fast lookup by product ID.
//                 const productMap = productResponses.reduce((acc: { [key: string]: Product }, response) => {
//                     const product = response.data;
//                     acc[product.id] = product;
//                     return acc;
//                 }, {});

//                 //  Save product map to state
//                 setProducts(productMap);
//             } catch (error: any) {
//                 console.error("Failed to fetch vendor data:", error.response?.data || error);
//                 Swal.fire({
//                     title: "Error!",
//                     text: "Failed to load orders. Please try again.",
//                     icon: "error",
//                     confirmButtonText: "OK",
//                 });
//             }
//         }

//         fetchVendorData();
//     }, [navigate])

//     return (
//         <div>
//             {/* Header component */}
//             <Header />

//             <section className="bg-gray-100 min-h-[87vh] p-8">

//                 <div className="flex items-center justify-between mb-10">
//                     <div className="flex items-center space-x-4">
//                         <BackButton />
//                         <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
//                     </div>
//                     <button
//                         onClick={() => navigate('/vendor-dashboard')}
//                         className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors"
//                     >
//                         Back to Dashboard
//                     </button>
//                 </div>

//                 <p className="text-gray-600 mb-6">View your orders and manage your balance.</p>

//                 <div className="space-y-6">
//                     {/* Balance Section */}
//                     <div className="bg-white p-6 rounded-lg shadow-md">
//                         <h2 className="text-xl font-semibold mb-4">Your Balance</h2>
//                         <p className="text-2xl font-bold text-gray-800">
//                             &#8358;{balance.toLocaleString()}
//                         </p>
//                         <button
//                             // onClick={}
//                             className="bg-green-600 px-4 py-2 text-white font-semibold rounded mt-4 cursor-pointer hover:bg-green-500"
//                         >
//                             Withdraw
//                         </button>
//                     </div>
//                     {/* Orders Section */}
//                     <div className="bg-white p-6 rounded-lg shadow-md">
//                         <h2 className="text-xl font-semibold mb-4">Your Orders</h2>

//                         <table className="w-full table-auto">
//                             <thead>
//                                 <tr className="bg-gray-200 text-gray-700">
//                                     <th className="px-4 py-2">Customer</th>
//                                     <th className="px-4 py-2">Product</th>
//                                     <th className="px-4 py-2">Price</th>
//                                     <th className="px-4 py-2">Quantity</th>
//                                     <th className="px-4 py-2">Amount</th>
//                                     <th className="px-4 py-2">Delivery Address</th>
//                                     <th className="px-4 py-2">Phone Number</th>
//                                     <th className="px-4 py-2">Email Address</th>
//                                     <th className="px-4 py-2">Order Status</th>
//                                     <th className="px-4 py-2">Order Date</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {orders.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
//                                             No orders found.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     orders.map((order) => (
//                                         <React.Fragment key={order.id}>
//                                             {order.Products.map((product, index) => (
//                                                 <tr key={`${order.id}-${product.ProductId}`} className="">
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? order.customerName : ""}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {products[product.ProductId]?.name}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         &#8358;{product.price.toFixed(2)}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {product.quantity}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         &#8358;{(product.price * product.quantity).toFixed(2)}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? order.shippingAddress : ""}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? order.customerPhone : ""}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? order.customerEmail : ""}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? order.orderStatus : ""}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         {index === 0 ? new Date(order.orderDate).toLocaleDateString() : ""}
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                             {/* Separator after each order */}
//                                             <tr>
//                                                 <td colSpan={10}>
//                                                     <hr className="my-2 border-t border-gray-400" />
//                                                 </td>
//                                             </tr>
//                                         </React.Fragment>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>


//                     </div>

//                 </div>

//             </section>

//             {/* Footer component */}
//             <Footer />
//         </div>
//     )
// }

// export default VendorOrdersPage

