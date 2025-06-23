/* eslint-disable @typescript-eslint/no-explicit-any */
// React hooks to manage state (e.g., the new password) and handle side effects
// (e.g., extracting the token from the URL).
import { useState, useEffect } from "react";
import axios from "axios";
// To handle navigation (redirecting after reset) and access the current URL (to get the token).
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 for popups
import SideBar from "../components/SideBar";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ResetPasswordPage = () => {
  const [token, setToken] = useState(""); // State to store the reset token from the URL
  const [newPassword, setNewPassword] = useState(""); // State to store the new password entered by the user
  const navigate = useNavigate(); // Hook to redirect the user (e.g., to login page)
  const location = useLocation(); // Hook to access the current URL and query parameters

  // Extract token from URL query parameter
  // This useEffect runs when the component loads (or when location or navigate changes).
  useEffect(() => {
    // location.search contains the query string (e.g., ?token=some-token).
    // URLSearchParams is a built-in browser API to parse query parameters. params.get("token") gets the value of the token parameter.
    const params = new URLSearchParams(location.search); // Parse query parameters from the URL
    const tokenFromUrl = params.get("token"); // Get the "token" parameter (e.g., "?token=some-token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl); // Save the token to state
    } else {
      Swal.fire({
        title: "Error!",
        text: "No reset token provided. Please request a new password reset link.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/auth/forgot-password"); // Redirect to forgot password page if no token
      });
    }
  }, [location, navigate]);

  // Handle form submission to reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from refreshing when the form is submitted
    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "Invalid reset token. Please request a new link.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
      }); // Send token and new password to backend
      console.log(response.data.message); // Log the success message from backend
      Swal.fire({
        title: "Success!",
        text: "Password reset successful! You can now log in with your new password.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/auth/login"); // Redirect to login page after success
      });
    } catch (err: any) {
      console.error(err.response?.data?.message || "Error resetting password");
      Swal.fire({
        title: "Error!",
        text:
          err.response?.data?.message ||
          "Error resetting password. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (

    <section className="flex flex-col md:flex-row min-h-screen">

      {/* Left Section: Branding */}
     <SideBar />

      {/* Right Section: New Password Form */}

      <div className="flex-1 flex bg-white items-center justify-center p-8">
        <div className="w-full max-w-md shadow-2xl p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Reset your password
          </h1>

          {/* Reset password form */}
          <form action="" onSubmit={handleResetPassword}>

            {/* New Password Input */}
            <div className="my-4">
              <label htmlFor="password" className="text-gray-700 font-medium">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4"
            >
              Set Password
            </button>

          </form>

        </div>
      </div>

    </section>
  );
};

export default ResetPasswordPage;

