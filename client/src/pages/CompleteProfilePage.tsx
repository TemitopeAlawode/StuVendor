/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import SideBar from "../components/SideBar";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const CompleteProfilePage = () => {
    // State for each input field
    const [userType, setUserType] = useState('');
    // const [studentStatus, setStudentStatus] = useState('');

    // for redirecting after complete profile success
    const navigate = useNavigate();

    // Check if user is authenticated (token exists)
    useEffect(() => {
        // localStorage.clear();
        // Retrieve the JWT token from localStorage (set during signup/login)
        const token = localStorage.getItem("token");
        // If no token exists, user is not authenticated
        if (!token) {
            Swal.fire({
                title: "Error!",
                text: "You must be logged in to complete your profile.",
                icon: "error",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/auth/login");
            });
        }
    }, [navigate]); // Dependency array includes navigate to ensure it’s up-to-date

    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Retrieve the JWT token from localStorage
            const token = localStorage.getItem("token");
            // Send a PUT request to the backend to update the user’s profile
            const response = await axios.put(`${API_BASE_URL}/auth/complete-profile`, {
                userType,
                // studentStatus
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Profile update response:", response.data);
            Swal.fire({
                title: "Success!",
                text: "Profile updated successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                // Redirect to the login page after the user clicks "OK"
                navigate("/auth/login");
            });
        } catch (error: any) {
            console.error("Profile update failed:", error.response?.data || error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update profile. Please try again.",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        }
    };

    return (
        <section className="flex flex-col md:flex-row min-h-screen">

            {/* Left Section: Branding */}
            <SideBar />

            {/* Right Section: Complete Profile Form */}
            <div className="flex-1 flex bg-white items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
                        COMPLETE YOUR PROFILE
                    </h1>

                    {/* Complete Profile Form */}
                    <form action=""
                        onSubmit={handleSubmit}
                    >
                        {/* User Type Dropdown */}
                        <div className="my-4">
                            <label htmlFor="userType" className="text-gray-700 font-medium">
                                I am a
                            </label>
                            <select
                                name="userType"
                                id="userType"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none "
                                required
                            >
                                <option value="">--- Select user type ---</option>
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                                {/* <option value="admin">Admin</option> */}
                            </select>
                        </div>

                        {/* Student Status Dropdown */}
                        {/* <div className="my-4">
                            <label htmlFor="studentStatus" className="text-gray-700 font-medium">
                                Are you a student?
                            </label>
                            <select
                                name="studentStatus"
                                id="studentStatus"
                                value={studentStatus}
                                onChange={(e) => setStudentStatus(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none "
                                required
                            >
                                <option value="">--- Select student Status ---</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div> */}

                        {/* Student Status Checkbox */}
                        {/* <div className="my-4 flex items-center">
                            <input
                                type="checkbox"
                                id="studentStatus"
                                name="studentStatus"
                                value={studentStatus}
                                onChange={(e) => setStudentStatus(e.target.value)}
                                className="mr-2 h-5 w-5 text-blue-950"
                            />
                            <label htmlFor="studentStatus" className="text-gray-700 font-medium">
                                I am a student
                            </label>
                        </div> */}


                        {/* Submit Button */}
                        <button type="submit" className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4">
                            Complete Profile
                        </button>

                    </form>

                </div>
            </div>

        </section>
    )
}

export default CompleteProfilePage