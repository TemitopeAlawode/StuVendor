/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Swal from "sweetalert2"; // Import SweetAlert2 for user alerts
import { useNavigate } from "react-router-dom"; // Import routing utilities for navigation
import axios from "axios"; // Import axios for HTTP requests
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch API services
import {
  getBanks,
  verifyBankAccount
} from '../services/api';

// Define the Vendor type based on my backend interface
interface Vendor {
  id: string;
  UserId: string;
  businessName: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  profilePicture?: string;
  bankCode: string
  bankAccountNumber: string
  bankAccountName: string
}

// Define Bank interface
interface Bank {
  id: string
  code: string
  name: string
}

const VendorDashboardPage = () => {

  // State for the vendor's business name..
  const [vendorName, setVendorName] = useState("Vendor");

  // State for vendor profile and edit form
  const [vendor, setVendor] = useState<Vendor | null>(null);
  // State to check if the profile is been edited or not
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedBusinessName, setEditedBusinessName] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null); // For previewing the selected image

  const [editedBankCode, setEditedBankCode] = useState('');
  const [editedBankAccountNumber, setEditedBankAccountNumber] = useState('');
  const [editedBankAccountName, setEditedBankAccountName] = useState('');


  // Define state for banks
  const [banks, setBanks] = useState<Bank[]>([]);

  // Define state for 'verifying' (that is when verifying account details)
  const [verifying, setVerifying] = useState(false);
  // State for 'verified' (after verification)
  const [isVerified, setIsVerified] = useState(false);

  // Hook for navigation
  const navigate = useNavigate();

  // Effect to check authentication and fetch vendor profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    // If no token, show error and redirect to login
    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "You must be logged in to access the vendor dashboard.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/auth/login");
      });
      return;
    };


    // Function to fetch vendor profile
    const fetchVendorProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/vendors/vendor-profile`, {
          headers: { Authorization: `Bearer ${token}` } // Include token in headers
        });
        setVendor(response.data); // Update vendor state
        setVendorName(response.data.businessName || "Vendor"); // Set vendor name for display

        // Pre-fill edit fields with current data
        setEditedBusinessName(response.data.businessName || "");
        setEditedAddress(response.data.address || "");
        setEditedPhoneNumber(response.data.phoneNumber || "");
        setEditedDescription(response.data.description || "");
        setEditedBankCode(response.data.bankCode || "");
        setEditedBankAccountNumber(response.data.bankAccountNumber || "");
        setEditedBankAccountName(response.data.bankAccountName || "");
        // Set initial preview to the existing profile picture
        setProfilePicturePreview(response.data.profilePicture ? `${API_BASE_URL}${response.data.profilePicture}` : null);

      } catch (error: any) {
        console.error("Failed to fetch vendor profile:", error.response.data || error);
        if (error.response?.status === 404) {
          Swal.fire({
            title: "Notice!",
            text: "You haven't created a vendor profile yet. Please create one.",
            icon: "info",
            confirmButtonText: "Create Profile",
          }).then(() => {
            navigate("/vendors/create-vendor-profile");
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to load vendor profile. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
          });
        };
      };

    }


    // Fetch Bank List
    const fetchBanks = async () => {
      const fetchedBankList = await getBanks();
      setBanks(fetchedBankList);
    }


    fetchVendorProfile(); // Call the fetch function
    fetchBanks();
  }, [navigate]); // Dependency array ensures effect runs when navigate changes


  // Update the preview when a new profile picture is selected
  useEffect(() => {
    if (editedProfilePicture) {
      const previewUrl = URL.createObjectURL(editedProfilePicture);
      setProfilePicturePreview(previewUrl);
      // Clean up the URL when the component unmounts or a new file is selected
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [editedProfilePicture]);

  // API for verifying bank account by the account number
  const handleVerifyBankAccount = async () => {
    setVerifying(true);
    const result = await verifyBankAccount(editedBankAccountNumber, editedBankCode);
    if (result) {
      setEditedBankAccountName(result);
      console.log(result);
      
      setIsVerified(true);
    }
    else {
      setIsVerified(false);
    }
    setVerifying(false);
  }


  // Function to handle updating the vendor profile
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token || !vendor || !isVerified) {
      Swal.fire({
        title: 'Error!',
        text: 'Please verify your bank account before saving changes.',
        icon: 'error',
      });
      return;
    }
    

    try {
      const formData = new FormData();
      formData.append("businessName", editedBusinessName);
      formData.append("address", editedAddress);
      formData.append("phoneNumber", editedPhoneNumber);
      formData.append("description", editedDescription);
      formData.append("bankCode", editedBankCode);
      formData.append("bankAccountNumber", editedBankAccountNumber);
      formData.append("bankAccountName", editedBankAccountName);
      if (editedProfilePicture) {
        formData.append("profilePicture", editedProfilePicture);
      }

      // Send PUT request to update vendor profile
      const response = await axios.put(`${API_BASE_URL}/vendors/update-vendor-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Required for file upload
          },
        },
      );
      setVendor(response.data.vendor); // Update vendor state with new data
      setShowEditForm(false); // Hide edit form
      // Reset the preview to the updated profile picture
      setProfilePicturePreview(response.data.vendor.profilePicture ? `${API_BASE_URL}${response.data.vendor.profilePicture}` : null);
      setEditedProfilePicture(null); // Clear the edited file

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


  return (
    <div>
      {/* Header component */}
      <Header />

      {/* Main dashboard content */}
      <section className='bg-gray-100 min-h-[87vh] p-8'>
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-4">Vendor Dashboard</h1> */}

        <div className="flex items-center justify-between mb-10">

          <div className="flex items-center space-x-4">
            {/* Button for navigating back to previous page*/}

            <BackButton />

            {/* <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1> */}
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {vendorName}!</h1>
          </div>

          <button
            onClick={() => navigate('/customer-dashboard')}
            // className=" border border-blue-600 text-blue-600 font-medium px-4 py-2 rounded cursor-pointer transition-colors hover:bg-gray-200">
            className="bg-blue-950 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-900 transition-colors">
            View Dashboard as a Customer
          </button>

        </div>

        {/* <p className="text-gray-600 mb-6">Welcome, {vendorName}!</p> */}
        <p className="text-gray-600 mb-6">Manage your vendor profile, products and orders here.</p>

        {/* Grid layout for dashboard sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}

          {/* Vendor Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6"> */}
            <h2 className="text-xl font-semibold mb-2">Your Vendor Profile</h2>

            {!showEditForm ? (
              <div className="space-y-2 text-sm sm:text-base">

                <div className="flex items-center justify-center">
                  <img
                    src={`${API_BASE_URL}${vendor?.profilePicture}`}
                    alt={vendor?.businessName}
                    className="rounded-full h-20 w-20 sm:h-20 sm:w-20 mb-2 object-cover border-2 border-blue-950"
                  />
                </div>


                <p><strong>Business Name: </strong> {vendor?.businessName || "Not provided"}</p>
                <p><strong>Address: </strong> {vendor?.address || "Not provided"}</p>
                <p><strong>Phone Number: </strong> {vendor?.phoneNumber || "Not provided"}</p>
                <p><strong>Description: </strong> {vendor?.description || "Not provided"}</p>
                {/* <p><strong>Bank Name: </strong> {vendor?.bankName || "Not provided"}</p> */}
                <p><strong>Bank Name: </strong>{banks.find((bank) => bank.code === vendor?.bankCode)?.name || "Not provided"}</p>
                <p><strong>Bank Account Number: </strong> {vendor?.bankAccountNumber || "Not provided"}</p>
                <p><strong>Bank Account Name: </strong> {vendor?.bankAccountName || "Not provided"}</p>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="bg-blue-950 text-white px-4 py-2 rounded mt-4 cursor-pointer hover:bg-blue-900"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm sm:text-base">
                {/* Vendor's profile Picture */}
                <div>
                  <label className="block text-gray-700 font-medium">Profile Picture</label>

                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="rounded h-16 w-16 sm:h-20 sm:w-20 mb-3 object-cover"
                    />
                  ) : (
                    <p className="text-gray-600 mb-2">No profile picture selected</p>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditedProfilePicture(e.target.files?.[0] || null)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Business Name Input */}
                <div>
                  <label className="block text-gray-700 font-medium">Business Name</label>
                  <input
                    type="text"
                    value={editedBusinessName}
                    onChange={(e) => setEditedBusinessName(e.target.value)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-gray-700 font-medium">Address</label>
                  <input
                    type="text"
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-gray-700 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={editedPhoneNumber}
                    onChange={(e) => setEditedPhoneNumber(e.target.value)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                    maxLength={11}
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-gray-700 font-medium">Description</label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Bank Selection Input */}
                <div className="my-4">
                  <label htmlFor="bankCode" className="text-gray-700 font-medium">Bank</label>
                  <select
                    id="bankCode"
                    // value={bankName}
                     value={editedBankCode}
                    onChange={(e) => setEditedBankCode(e.target.value)}
                    // Getting the bank code through the bankname
                    // It searches through the banks array to find one bank
                    //  where the code matches the value selected from a form input 
                    // onChange={(e) => {
                    //   const selectedBank = banks.find((bank) => bank.code === e.target.value);
                    //   setEditedBankCode(e.target.value);
                    //   setEditedBankName(selectedBank?.name || '');
                    // }}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                    required
                  >
                    <option value="">Select a bank</option>
                    {/* Populate with the bank list */}
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.code}>{bank.name}</option>
                      // <option key={bank.id} value={bank.code} selected={bank.name === editedBankCode}>{bank.name}</option>
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
                      value={editedBankAccountNumber}
                      onChange={
                        (e) => {
                          setEditedBankAccountNumber(e.target.value)
                          setIsVerified(false); // Reset verification on change of value
                        }}
                      className="w-full border border-gray-400 px-4 py-2 rounded-l-lg focus:outline-none"
                      placeholder="Enter your account number e.g. 1234567890"
                      maxLength={10}
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
                    value={editedBankAccountName}
                    onChange={(e) => setEditedBankAccountName(e.target.value)}
                    className="w-full border border-gray-400 px-4 py-2 rounded-lg focus:outline-none"
                    placeholder="Verified account name will appear here"
                    readOnly
                    required
                  />
                  {isVerified && <p className='text-green-600 text-sm mt-1'>Account verified!</p>}
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
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                    >
                    Cancel
                  </button>
                </div>

              </div>
            )
            }
          </div>

          {/* Product Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
            <p className="text-gray-600">
              View and manage your products.
            </p>

            <button
              onClick={() => navigate('/vendor/products')}
              className="bg-blue-950 text-white px-4 py-2 rounded mt-4 cursor-pointer hover:bg-blue-900">
              Manage/View Products
            </button>

            {/* <div className="mt-6">
              <Link to={'/vendor/products'}
                className="bg-blue-950 text-white px-4 py-3 rounded cursor-pointer hover:bg-blue-900">
                Manage/View Products
              </Link>
            </div> */}

          </div>

          {/* Order Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">Manage Orders</h2>
            <p className="text-gray-600">
              View and manage your orders.
            </p>

            <button
              onClick={() => navigate('/vendor/orders')}
              className="bg-blue-950 text-white px-4 py-2 rounded mt-4 cursor-pointer hover:bg-blue-900">
              View Orders
            </button>

          </div>

        </div>

      </section>

      {/* Footer Component */}
      <Footer />

    </div>
  );
};

export default VendorDashboardPage