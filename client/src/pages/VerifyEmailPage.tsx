/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");
            if (!token) {
                setMessage("Invalid verification link");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/auth/verify-email`, {
                    params: { token },
                });
                setMessage(response.data.message);
                setLoading(false);
                Swal.fire({
                    title: "Success!",
                    text: "Email verified successfully. You can now log in.",
                    icon: "success",
                    confirmButtonText: "Go to Login",
                }).then(() => {
                    // Redirect to login page with email and password in state
    //   navigate('/auth/login', { state: { email, password } });
                    navigate("/auth/login");
                });
            } catch (error: any) {
                console.error("Failed to verify email:", error.response?.data || error);
                setMessage(error.response?.data?.message || "Failed to verify email");
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow flex items-center justify-center bg-gray-100">
                    <p className="text-gray-600 text-lg">Verifying email...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center bg-gray-100 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h1>
                    <p className="text-gray-600 mb-4">{message}</p>
                    <button
                        className="bg-blue-950 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                        onClick={() => navigate("/auth/login")}
                    >
                        Go to Login
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VerifyEmailPage;