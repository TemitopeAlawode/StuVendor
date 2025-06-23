/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { useGoogleLogin } from "@react-oauth/google"; // Import Google OAuth hook
import SideBar from "../components/SideBar";
import ClipLoader from 'react-spinners/ClipLoader'; // Import ClipLoader

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SignupPage = () => {

  // State for each input field
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  // const [studentStatus, setStudentStatus] = useState('');

  // for redirecting after signup success
  const navigate = useNavigate();

  // Function to handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name,
        email,
        password,
        userType,
        // studentStatus: studentStatus === 'True'
      });
      console.log('Signup successful:', response.data);

// Store email in localStorage temporarily to be retrieved in the login page
      localStorage.setItem("tempSignupEmail", email);

     
      // setTimeout(() => {
      // Using Sweetalert2 for success message
      Swal.fire({
        title: "Success!",
        text: "Registration Successful. Please check your email to verify your account.",
        icon: "success",
        confirmButtonText: "OK",
      });
      // }, 20000);

      // Clear form and navigate on success
      setName('');
      setEmail('');
      setPassword('');
      setUserType('');
      // setStudentStatus('');

      // No immediate redirect to login; user will verify email first

      // Redirect to login page with email and password in state
      // navigate('/auth/login', { state: { email, password } });

    // Navigate to verify email page
      // navigate('/auth/verify-email')

    }
    catch (error: any) {
      console.error('Signup error', error);
      // Using Sweetalert2 for error message
      Swal.fire({
        title: "Error!",
        text: error.response.data.error || " Signup failed. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
    finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };
  // ================== End of Function to handle signup form submission


  // Function to handle Google signup
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); // Start loading

      try {
        // Send the Google access token to the backend
        const response = await axios.post(`${API_BASE_URL}/auth/google`, {
          access_token: tokenResponse.access_token,
          action: "signup", // Specify the action as signup
        });
        console.log("Google signup successful:", response.data);
        localStorage.setItem("token", response.data.token); // Store token

        Swal.fire({
          title: "Success!",
          text: "Registration Successful with Google!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Redirect to complete profile if profile isn't completed
          if (!response.data.user.profileCompleted) {
            navigate("/auth/complete-profile");
          } else {
            navigate("/auth/login");
          }
          // navigate("/auth/login");
        });
      } catch (error: any) {
        console.error("Google signup failed:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.message || "Google signup failed. Please try again.",
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
  //====================== End of Function to handle Google signup

  return (
    <section className="flex flex-col md:flex-row min-h-screen">

      {/* Left Section: Branding  */}
      <SideBar />

      {/* Right Section: Signup Form */}
      <div className="flex-1 flex bg-white items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            SIGNUP
          </h1>

          {/* Google Signup/Login Button */}

          <button type="button"
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


          {/* Signup Form */}
          <form action="" onSubmit={handleSignup}>
            {/* Name Input */}
            <div className="my-4">
              <label htmlFor="name" className="text-gray-700 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                required
              />
            </div>

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


            {/* Signup Button */}

            {/* <button type="submit" 
            className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4">
              Sign Up
            </button> */}

            <button
              type="submit"
              className={`w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4 flex items-center justify-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color={'#ffffff'} loading={loading} /> // ClipLoader spinner
              ) : (
                'Sign Up'
              )}
            </button>

          </form>

          {/* Link to Login Page */}
          <p className="text-center text-gray-700">
            Already have an account? { }
            <Link to="/auth/login" className="text-blue-950 font-bold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>

    </section>
  );
};

export default SignupPage;

