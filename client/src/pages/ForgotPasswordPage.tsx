/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useState } from "react";
import Swal from 'sweetalert2'
import SideBar from "../components/SideBar";
// import { useNavigate } from "react-router";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;



const ForgotPasswordPage = () => {
  // State for the email input field
  const [email, setEmail] = useState('');

  // Function to handle reset password form submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      console.log('Reset password email sent successfully!!', response.data);
      // alert('Reset password email sent successfully!!');
      // Using Sweetalert2 for success message
      Swal.fire({
        title: "Success!",
        text: "Reset password email sent successfully!!",
        icon: "success",
        confirmButtonText: "OK",
      })
    }
    catch (error: any) {
      console.error('Error sending reset email', error);
      // alert('Error sending reset email');
      // Using Sweetalert2 for error message
      Swal.fire({
        title: "Error!",
        text: error.response.data.error || "Error sending reset password email.",
        icon: "error",
        confirmButtonText: "Try Again",
      })
    }
  }


  return (
    <section className="flex flex-col md:flex-row min-h-screen">

      {/* Left Section: Branding */}
      <SideBar />

      {/* Right Section: Reset Password Form */}
      <div className="flex-1 flex bg-white items-center justify-center p-8">
        <div className="w-full max-w-md shadow-2xl p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Reset your password
          </h1>
          <h3 className="text-center text-gray-700 text-sm">Enter your email and we'll send a link to reset your password.
            Please check your email and follow the instructions.</h3>


          {/* Reset Password Form */}
          <form action="" onSubmit={handleForgotPassword}>

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

            {/*  Send an email Button */}
            <button type="submit" className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4">
              Send an email
            </button>

          </form>

        </div>
      </div>

    </section>
  )
}

export default ForgotPasswordPage