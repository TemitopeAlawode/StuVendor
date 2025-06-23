/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { useGoogleLogin } from "@react-oauth/google"; // Import Google OAuth hook
import SideBar from "../components/SideBar";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import ClipLoader from 'react-spinners/ClipLoader'; // Import ClipLoader

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Interface for decoded JWT payload to ensure type safety
interface DecodedJWToken {
    id: string; // User ID from the JWT
    userType?: 'customer' | 'vendor' | 'admin';
}

const LoginPage = () => {

    // use the useLocation hook from react-router-dom to access the navigation state 
    // and prefill the email and password fields.

    // for redirecting after login success
    const navigate = useNavigate();

    // const location = useLocation(); // Access navigation state

    // Initialize state with values from navigation state (if available)
    // State for each input field
    // const [email, setEmail] = useState(location.state?.email || '');
    // const [password, setPassword] = useState(location.state?.password || '');

    // Retrieve temp signup email from localStorage
    const tempEmail = localStorage.getItem("tempSignupEmail") || "";

    const [email, setEmail] = useState(tempEmail);
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false); // Loading state
    
    // Clear temp credentials from localStorage when component mounts or fields change
    useEffect(() => {
        // Only clear if the user manually changes the fields or logs in
        return () => {
            if (email !== tempEmail) {
                localStorage.removeItem("tempSignupEmail");
                localStorage.removeItem("tempSignupPassword");
            }
        };
    }, [email, tempEmail]);


    // Function to handle manual login form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevents page refresh
        setLoading(true); // Start loading

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
                email,
                password,
            })
            console.log('Login successful:', response.data);
            const token = response.data.token;
            localStorage.setItem("token", token); // Store the token

            // Decode the token to get userType
            const decodedToken: DecodedJWToken = jwtDecode(token);
            const userType = decodedToken.userType;
            console.log("Decoded UserType:", userType);


            // Function to handle page navigation based on userType and profile completion
            const handleNavigation = async () => {
                if (userType === 'vendor') {
                    try {
                        // Check if vendor profile already exist
                        const vendorResponse = await axios.get(`${API_BASE_URL}/vendors/vendor-profile`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        console.log('Vendor Profile Check: ', vendorResponse.data);
                        // After vendor profile verification, navigate to the vendor dashboard page
                        navigate('/vendor-dashboard');
                    } catch (error: any) {
                        // if (error.response.status === 404) {
                            // Navigate to create a vendor profile
                            console.error('Error: ', error);
                            navigate('/vendors/create-vendor-profile');
                        // }
                        // else {
                        //     Swal.fire({
                        //         title: "Error!",
                        //         text: "Failed to check vendor profile. Please try again.",
                        //         icon: "error",
                        //         confirmButtonText: "OK",
                        //     });
                        //     return;
                        // };
                    };
                }
                // If userType !== 'vendor'
                else {
                    // Check if profile has been completed
                    // if (profileCompleted === false) {
                    console.log('Profile Complete: ', response.data.user.profileCompleted);

                    if (response.data.user.profileCompleted === false) {
                        console.log("Profile Completed: ", response.data.user.profileCompleted);
                        // Navigate to complete profile
                        navigate('/auth/complete-profile');
                    }
                    else {
                        // Navigate to products page
                        navigate('/products');
                    };
                };
            };

            // Using Sweetalert2 for success message
            Swal.fire({
                title: "Success!",
                text: "Login Successful!!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                handleNavigation();
            });

            // Clear form and navigate on success
            setEmail('');
            setPassword('');

        } catch (error: any) {
            console.error('Login error', error);
            // Using Sweetalert2 for error message
            Swal.fire({
                title: "Error!",
                text: error.response.data.message,
                // text: error.response.data.error || " Login failed. Please sign up first.",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        }
        finally {
        setLoading(false); // Stop loading
      }
    };
    //================================ Function to handle login form submission



    // Function to handle Google login
    const handleGoogleLogin = useGoogleLogin({

        onSuccess: async (tokenResponse) => {
            setLoading(true); // Start loading
            try {
                // Send the Google access token to the backend
                const response = await axios.post(`${API_BASE_URL}/auth/google`, {
                    access_token: tokenResponse.access_token,
                    action: "login", // Specify the action as login
                });

                console.log("Google Login successful:", response.data);
                const token = response.data.token;
                localStorage.setItem("token", token); // Store the token

                // Function to handle navigation to pages based on userType and profile completion
                const handleGoogleNavigation = async () => {
                    console.log('UserType: ', response.data.user.userType);

                    // If userType === 'vendor'
                    if (response.data.user.userType === 'vendor') {
                        try {
                            // Check if vendor profile already exist
                            const vendorResponse = await axios.get(`${API_BASE_URL}/vendors/vendor-profile`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            console.log('Vendor Profile Check: ', vendorResponse.data);
                            // After vendor profile verification, navigate to the vendor dashboard page
                            navigate('/vendor-dashboard');
                        } catch (error: any) {
                            if (error.response.status === 404) {
                                // Navigate to create a vendor profile
                                navigate('/vendors/create-vendor-profile');
                            }
                            else {
                                Swal.fire({
                                    title: "Error!",
                                    text: "Failed to check vendor profile. Please try again.",
                                    icon: "error",
                                    confirmButtonText: "OK",
                                });
                                return;
                            };
                        };
                    }
                    // If userType !== 'vendor' (userType === 'customer' )
                    else {
                        console.log("Profile Complete: ", response.data.user.profileCompleted);
                        // Redirect to complete profile if profile isn't completed
                        // if (!response.data.user.profileCompleted) {
                        if (response.data.user.profileCompleted === false) {
                            navigate("/auth/complete-profile");
                        } else {
                            navigate("/products");
                        }
                    };
                };

                // Login Success Alert
                Swal.fire({
                    title: "Success!",
                    text: "Login Successful with Google!",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    handleGoogleNavigation();
                });
            } catch (error: any) {
                console.error("Google Login failed:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Google Login failed. Please sign up first.",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
            }
            finally {
        setLoading(false); // Stop loading
      }
        },

        onError: error => {
            console.error("Google login error:", error);
            // Handle login error
            Swal.fire({
                title: "Error!",
                text: "An error occurred during Google login.",
                icon: "error",
                confirmButtonText: "OK",
            });
        },
        flow: "implicit",
    });
    //====================== End of Function to handle Google Login



    return (
        <section className="flex flex-col md:flex-row min-h-screen">

            {/* Left Section: Branding */}
            <SideBar />

            {/* Right Section: Login/Signin Form */}
            <div className="flex-1 flex bg-white items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
                        LOGIN/SIGNIN
                    </h1>

                    {/* Google Signup/Login Button */}
                    <button
                        onClick={() => handleGoogleLogin()}
                        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 flex items-center justify-center py-2 px-4 rounded-lg mb-4 cursor-pointer"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.78h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.78c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.72 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* <h2 className="text-center text-gray-500 mb-4">-------------- OR ----------------</h2> */}
                    <div className="flex items-center text-gray-500">
                        <hr className="w-1/2 border-gray-300" />
                        <span className="mx-2">OR</span>
                        <hr className="w-1/2 border-gray-300" />
                    </div>


                    {/* Login Form */}
                    <form action="" onSubmit={handleLogin}>

                        {/* Email Input */}
                        <div className="my-4">
                            <label htmlFor="email" className="text-gray-700 font-medium">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none "
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="my-4">
                            <label htmlFor="password" className="text-gray-700 font-medium">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none "
                                required
                            />
                        </div>


                        {/* Forgot Password */}
                        <p>
                            <Link to="/auth/forgot-password" className="text-blue-700 hover:underline">
                                Forgot your password?
                            </Link>
                        </p>

                        {/* Login Button */}

                        {/* <button type="submit" className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4">
                            Login
                        </button> */}

                        <button
              type="submit"
              className={`w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4 flex items-center justify-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color={'#ffffff'} loading={loading} /> : 'Login'}
            </button>


                    </form>

                    {/* Link to Signup Page */}
                    <p className="text-center  text-gray-700">
                        Don't have an account? { }
                        <Link to="/auth/signup" className="hover:underline font-bold text-blue-950">
                            Create Account
                        </Link>
                    </p>

                </div>
            </div>

        </section>
    );
};

export default LoginPage;
