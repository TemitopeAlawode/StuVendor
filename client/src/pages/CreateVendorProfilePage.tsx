/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2";
import SideBar from "../components/SideBar";

// Fetch API services
import {
    getBanks,
    // verifyBankAccount
} from '../services/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define Bank interface
interface Bank {
    id: string
    code: string
    name: string
}

const CreateVendorProfilePage = () => {

    // State for each form field
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [description, setDescription] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    const [bankCode, setBankCode] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    

    // Define state for banks
    const [banks, setBanks] = useState<Bank[]>([]);

    // Define state for 'verifying' (that is when verifying account details)
    const [verifying, setVerifying] = useState(false);
    // State for 'verified' (after verification)
    const [isVerified, setIsVerified] = useState(false);


    // Hook to handle navigation/redirects after form submission
    const navigate = useNavigate();

    // Effect to check if the user is authenticated when the component mounts
    useEffect(() => {
        // Retrieve the JWT token from localStorage (set during login/signup)
        const token = localStorage.getItem("token");
        // If no token exists, user is not authenticated
        if (!token) {
            // Show an error popup using SweetAlert2
            Swal.fire({
                title: "Error!",
                text: "You must be logged in to create a vendor profile.",
                icon: "error",
                confirmButtonText: "OK",
            }).then(() => {
                // Redirect to the login page
                navigate("/auth/login");
            });
            return;
        }

        // Fetch Bank List
        const fetchBanks = async () => {
            const fetchedBankList = await getBanks();
            setBanks(fetchedBankList);
        }

        fetchBanks();
    }, [navigate]); // Dependency array includes navigate to ensure it’s up-to-date


    // API for verifying bank account by the account number
    const handleVerifyBankAccount = async () => {
        if (bankAccountNumber.length !== 10 || !bankCode) {
            Swal.fire({
                title: 'Error!',
                text: 'Please select a bank and enter a 10-digit account number.',
                icon: 'error',
            });
            return;
        }

        setVerifying(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/verify-bank-account`, {
                bankAccountNumber,
                bankCode
            });
            setBankAccountName(response.data.bankAccountName);
            setIsVerified(true);
            Swal.fire({
                title: 'Success!',
                text: `Account verified: ${response.data.bankAccountName}`,
                icon: 'success',
            });
        } catch (error: any) {
            console.error('Verification failed:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to verify account.',
                icon: 'error',
            });
            setIsVerified(false);
        }
        finally{
        setVerifying(false);
        }
    }
   
    
    // API for verifying bank account by the account number
    // const handleVerifyBankAccount = async () => {
    //     setVerifying(true);
    //     const result = await verifyBankAccount(bankAccountNumber, bankCode);
    //     if (result) {
    //         setBankAccountName(result.bankAccountName);
    //         setIsVerified(true);
    //     }
    //     else {
    //         setIsVerified(false);
    //     }
    //     setVerifying(false);
    // }


    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior (page reload)

        // Check to ensure account details has been verified..
        if (!isVerified) {
            Swal.fire({
                title: 'Error!',
                text: 'Please verify your bank account before submitting.',
                icon: 'error',
            });
            return;
        }

        // Retrieve the JWT token from localStorage
        const token = localStorage.getItem("token");

        // Using FormData to handle file upload and form fields
        const formData = new FormData();
        formData.append("businessName", businessName);
        formData.append("address", address);
        formData.append("phoneNumber", phoneNumber);
        formData.append("description", description);
        formData.append("bankCode", bankCode);
        formData.append("bankAccountNumber", bankAccountNumber);
        formData.append("bankAccountName", bankAccountName);
        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            // Send a POST request to the backend to create the vendor profile
            const response = await axios.post(`${API_BASE_URL}/vendors/create-vendor-profile`, formData, {
                headers: {
                    // Include the JWT token in the Authorization header for authentication
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data" // Required for file upload
                },
            });

            // Log the response for debugging
            console.log("Vendor profile creation response:", response.data);

            // Show a success popup using SweetAlert2
            Swal.fire({
                title: "Success!",
                text: "Vendor profile created successfully!",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                // Redirect to the vendor dashboard after the user clicks "OK"
                navigate("/vendor-dashboard");
            });
        } catch (error: any) {
            // Log the error for debugging (includes backend response if available)
            console.error("Vendor profile creation failed:", error.response?.data || error);

            // Show an error popup with the backend’s error message (or a fallback message)
            Swal.fire({
                title: "Error!",
                text: error.response.data.message || "Failed to create vendor profile. Please try again.",
                icon: "error",
                confirmButtonText: "Try Again",
            });
        }
    }

    return (
        // Main section with a responsive flex layout (column on mobile, row on larger screens)
        <section className="flex flex-col md:flex-row min-h-screen">


            {/* Left Section: Branding */}
            <SideBar />

            {/* Right Section: Create Vendor Profile Form */}

            <div className="flex-1 flex bg-white items-center justify-center p-8">
                <div className="w-full max-w-md">

                    {/* Form title */}
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
                        CREATE VENDOR PROFILE
                    </h1>

                    {/* Create Vendor Profile Form */}
                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* Vendor's picture */}
                        <div className="my-4">
                            <label className="text-gray-700 font-medium">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                required
                            />
                        </div>

                        {/* Business Name Input */}
                        <div className="my-4">
                            <label htmlFor="businessName" className="text-gray-700 font-medium">
                                Business Name
                            </label>
                            <input
                                type="text"
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                placeholder="Enter your business name"
                                required
                            />
                        </div>

                        {/* Address Input */}
                        <div className="my-4">
                            <label htmlFor="address" className="text-gray-700 font-medium">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                placeholder="Enter your business address"
                                required
                            />
                        </div>

                        {/* Phone Number Input */}
                        <div className="my-4">
                            <label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                placeholder="Enter your phone number (e.g. 1234567890)"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="my-4">
                            <label htmlFor="description" className="text-gray-700 font-medium">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                placeholder="Describe your business"
                            />
                        </div>

                        {/* Bank Selection Input */}
                        <div className="my-4">
                            <label htmlFor="bankCode" className="text-gray-700 font-medium">Bank</label>
                            <select
                                id="bankCode"
                                // value={bankName}
                                value={bankCode}
                                onChange={(e) => setBankCode(e.target.value)}
                                // Getting the bank code through the bankname
                                // It searches through the banks array to find one bank
                                //  where the code matches the value selected from a form input 
                                // onChange={(e) => {
                                //     const selectedBank = banks.find((bank) => bank.code === e.target.value);
                                //     setBankCode(e.target.value);
                                //     setBankName(selectedBank?.name || '');
                                // }}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                required
                            >
                                <option value="">Select a bank</option>
                                {/* Populate with the bank list */}
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.code}>{bank.name}</option>
                                    // <option key={bank.id} value={bank.code}>{bank.name} ({bank.code})</option>
                                ))}
                            </select>
                        </div>

                        {/* Bank Account Number Input */}
                        <div className="my-4">
                            <label htmlFor="accountNumber" className="text-gray-700 font-medium">
                                Bank Account Number
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="accountNumber"
                                    value={bankAccountNumber}
                                    onChange={
                                        (e) => {
                                            setBankAccountNumber(e.target.value)
                                            setIsVerified(false); // Reset verification on change of value
                                        }}
                                    className="w-full border border-gray-400 px-4 py-2 rounded-l-lg focus:outline-none"
                                    placeholder="Enter your account number e.g. 1234567890"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyBankAccount}
                                    className='bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-r-lg cursor-pointer'
                                >
                                    {/* Verify */}
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        {/* Bank Account Name Input */}
                        <div className="my-4">
                            <label htmlFor="accountName" className="text-gray-700 font-medium">
                                Bank Account Name
                            </label>
                            <input
                                type="text"
                                id="accountName"
                                value={bankAccountName}
                                onChange={(e) => setBankAccountName(e.target.value)}
                                className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                                placeholder="Verified account name will appear here"
                                readOnly
                                required
                            />
                            {isVerified && <p className='text-green-600 text-sm mt-1'>Account verified!</p>}
                        </div>


                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full cursor-pointer text-white bg-blue-950 hover:bg-blue-900 rounded-lg py-2 my-4"
                        >
                            Create Vendor Profile
                        </button>

                    </form>

                </div>
            </div>

        </section>
    )
}

export default CreateVendorProfilePage