/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import BackButton from "../components/BackButton";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface DecodedToken {
    id: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    userType: "vendor" | "customer" | "admin";
}


const CustomerDashboardPage = () => {
    const [user, setUser] = useState<User | null>(null);

    // State to check if the profile is been edited or not
    const [showEditForm, setShowEditForm] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedUserType, setEditedUserType] = useState('');

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                title: "Login Required",
                text: "Please log in to access your dashboard.",
                icon: "warning",
                confirmButtonText: "OK",
            }).then(() => navigate("/auth/login"));
            return;
        }

        const fetchData = async () => {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                const userId = decoded.id;

                // Fetch user details
                const userResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(userResponse.data);

                // Pre-fill edit fields with current data
                setEditedName(userResponse.data.name || '');
                setEditedEmail(userResponse.data.email || '');
                setEditedUserType(userResponse.data.userType || '');

            } catch (error: any) {
                console.error("Failed to fetch data:", error);
                Swal.fire({
                    title: "Error",
                    text: error.response?.data?.message || "Failed to load dashboard.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);


    // Function to handle updating the vendor profile
    const handleUpdateProfile = async () => {
        const token = localStorage.getItem("token");

        try {

            const editedUserInfo = {
                name: editedName,
                email: editedEmail
            }

            // Send PUT request to update user profile
            const response = await axios.put(`${API_BASE_URL}/auth/update-profile`,
                editedUserInfo,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setUser(response.data); // Update user state with new data
            setShowEditForm(false); // Hide edit form

            // Show success alert
            Swal.fire({
                title: "Success!",
                text: "Vendor profile updated successfully!",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error: any) {
            console.error("Failed to update vendor profile:", error.response?.data || error);
            // Show error alert
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update vendor profile. Please try again.",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        };
    };


    if (loading) {
        return (
            <div className="bg-gray-100 min-h-[87vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-xl text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <section className="bg-gray-100 min-h-[87vh] p-8">
                <div className="max-w-7xl mx-auto">

                     <div className="flex items-center space-x-4 mb-6">
            {/* Button for navigating back to previous page*/}

            <BackButton />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Welcome, {user?.name || "Customer"}
                    </h1>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Overview */}
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">About You</h2>

                            {!showEditForm ? (
                                <div className="space-y-2">
                                    <p className="text-sm sm:text-base"><strong>Name: </strong> {user?.name || "Not provided"}</p>
                                    <p className="text-sm sm:text-base"><strong>Email: </strong> {user?.email || "Not provided"}</p>
                                    <p className="text-sm sm:text-base"><strong>User Type: </strong> {user?.userType || "Not provided"}</p>
                                    <button
                                        onClick={() => setShowEditForm(true)}
                                        className="mt-4 bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 cursor-pointer transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>

                            ) : (
                                <div className="space-y-4">
                                    {/* Vendor's profile Picture */}
                                    <div >

                                        {/* Name Input */}
                                        <div>
                                            <label className="block text-gray-700 font-medium">Name</label>
                                            <input
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="w-full border border-gray-400 px-4 py-2 mb-4 rounded-lg focus:outline-none "
                                                required
                                            />
                                        </div>

                                        {/* Email Input */}
                                        <div>
                                            <label className="block text-gray-700 font-medium">Email Address</label>
                                            <input
                                                type="text"
                                                value={editedEmail}
                                                onChange={(e) => setEditedEmail(e.target.value)}
                                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                                required
                                            />
                                        </div>

                                        {/* User Type Input */}
                                        <div className="my-4">
                                            <label className="text-gray-700 font-medium">
                                                User Type
                                            </label>
                                            <input
                                                type="text"
                                                value={editedUserType}
                                                onChange={(e) => setEditedUserType(e.target.value)}
                                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                                readOnly
                                                required
                                            />
                                        </div>

                                    </div>

                                    {/* 'Save Changes' and 'Cancel' button */}
                                    <div className="flex flex-col sm:flex-row gap-2">

                                        {/* Save Changes button*/}
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-500">
                                            Save Changes
                                        </button>

                                        {/* Cancel button */}
                                        <button
                                            onClick={() => setShowEditForm(false)}
                                            className="bg-red-600 text-white hover:bg-red-500 cursor-pointer px-4 py-2 rounded">
                                            Cancel
                                        </button>
                                    </div>

                                </div>
                            )}

                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 ">Recent Orders</h2>

                            <button
                                onClick={() => navigate("/users/orders")}
                                className="mt-4 text-blue-800 hover:text-blue-900 font-medium cursor-pointer"
                            >
                                View All Orders &rarr;
                            </button>
                        </div>
                        {/* Quick Links */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
                            <ul className="space-y-2 font-medium">
                                <li>
                                    <Link to="/liked-products" className="text-blue-800 hover:text-blue-900">
                                        View Liked Products
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shopping-cart" className="text-blue-800 hover:text-blue-900">
                                        View Cart
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/users/orders" className="text-blue-800 hover:text-blue-900">
                                        Order History
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CustomerDashboardPage;