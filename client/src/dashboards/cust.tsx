/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../components/Header";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { getBanks, verifyBankAccount } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Vendor {
  id: string;
  UserId: string;
  businessName: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  profilePicture?: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

interface Bank {
  id: string;
  code: string;
  name: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: { message?: string };
  };
}

// Custom hook for fetching vendor profile and banks
const useVendorData = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "You must be logged in to access the vendor dashboard.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => navigate("/auth/login"));
      return;
    }

    setLoading(true);
    try {
      const [vendorResponse, banksResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/vendors/vendor-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        getBanks(),
      ]);
      setVendor(vendorResponse.data);
      setBanks(banksResponse);
    } catch (error: any) {
      console.error("Failed to fetch data:", error.response?.data || error);
      if (error.response?.status === 404) {
        Swal.fire({
          title: "Notice!",
          text: "You haven't created a vendor profile yet. Please create one.",
          icon: "info",
          confirmButtonText: "Create Profile",
        }).then(() => navigate("/vendors/create-vendor-profile"));
      } else {
        setError(error.response?.data?.message || "Failed to load vendor profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { vendor, banks, loading, error, fetchData, setVendor };
};

// Component for the edit profile form
const EditProfileForm = ({
  vendor,
  banks,
  onSave,
  onCancel,
}: {
  vendor: Vendor | null;
  banks: Bank[];
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) => {
  const [editedBusinessName, setEditedBusinessName] = useState(vendor?.businessName || "");
  const [editedAddress, setEditedAddress] = useState(vendor?.address || "");
  const [editedPhoneNumber, setEditedPhoneNumber] = useState(vendor?.phoneNumber || "");
  const [editedDescription, setEditedDescription] = useState(vendor?.description || "");
  const [editedBankCode, setEditedBankCode] = useState(vendor?.bankCode || "");
  const [editedBankAccountNumber, setEditedBankAccountNumber] = useState(vendor?.bankAccountNumber || "");
  const [editedBankAccountName, setEditedBankAccountName] = useState(vendor?.bankAccountName || "");
  const [editedProfilePicture, setEditedProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    vendor?.profilePicture ? `${API_BASE_URL}${vendor.profilePicture}` : null
  );
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(!!vendor?.bankAccountName);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview for profile picture
  useEffect(() => {
    if (editedProfilePicture) {
      const previewUrl = URL.createObjectURL(editedProfilePicture);
      setProfilePicturePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [editedProfilePicture]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!editedBusinessName.trim()) newErrors.businessName = "Business name is required.";
    if (editedPhoneNumber && !/^\d{11}$/.test(editedPhoneNumber))
      newErrors.phoneNumber = "Phone number must be 11 digits.";
    if (!editedBankCode) newErrors.bankCode = "Please select a bank.";
    if (!editedBankAccountNumber || !/^\d{10}$/.test(editedBankAccountNumber))
      newErrors.bankAccountNumber = "Account number must be 10 digits.";
    if (!isVerified) newErrors.bankAccountName = "Please verify your bank account.";
    if (editedProfilePicture && editedProfilePicture.size > 5 * 1024 * 1024)
      newErrors.profilePicture = "Profile picture must be less than 5MB.";
    if (editedProfilePicture && !editedProfilePicture.type.startsWith("image/"))
      newErrors.profilePicture = "Profile picture must be an image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debounced bank verification
  const handleVerifyBankAccount = useCallback(async () => {
    if (!editedBankCode || !editedBankAccountNumber || !/^\d{10}$/.test(editedBankAccountNumber)) {
      setErrors((prev) => ({ ...prev, bankAccountNumber: "Valid account number and bank are required." }));
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyBankAccount(editedBankAccountNumber, editedBankCode);
      if (result) {
        setEditedBankAccountName(result);
        setIsVerified(true);
        setErrors((prev) => ({ ...prev, bankAccountName: "" }));
      } else {
        setIsVerified(false);
        setErrors((prev) => ({ ...prev, bankAccountName: "Failed to verify account." }));
      }
    } catch (error) {
      setIsVerified(false);
      setErrors((prev) => ({ ...prev, bankAccountName: "Failed to verify account." }));
    } finally {
      setVerifying(false);
    }
  }, [editedBankAccountNumber, editedBankCode]);

  const handleSave = () => {
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append("businessName", editedBusinessName);
    formData.append("address", editedAddress);
    formData.append("phoneNumber", editedPhoneNumber);
    formData.append("description", editedDescription);
    formData.append("bankCode", editedBankCode);
    formData.append("bankAccountNumber", editedBankAccountNumber);
    formData.append("bankAccountName", editedBankAccountName);
    if (editedProfilePicture) formData.append("profilePicture", editedProfilePicture);
    onSave(formData);
  };

  const handleRemovePicture = () => {
    setEditedProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 text-sm sm:text-base">
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="profilePicture">
          Profile Picture
        </label>
        {profilePicturePreview ? (
          <div className="flex items-center space-x-4">
            <img
              src={profilePicturePreview}
              alt="Profile Preview"
              className="rounded-full h-16 w-16 object-cover border-2 border-blue-950"
            />
            <button
              onClick={handleRemovePicture}
              className="text-red-600 hover:underline text-sm"
              aria-label="Remove profile picture"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-gray-600 mb-2">No profile picture selected</p>
        )}
        <input
          id="profilePicture"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setEditedProfilePicture(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
        />
        {errors.profilePicture && <p className="text-red-600 text-sm mt-1">{errors.profilePicture}</p>}
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="businessName">
          Business Name
        </label>
        <input
          id="businessName"
          type="text"
          value={editedBusinessName}
          onChange={(e) => setEditedBusinessName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
          aria-required="true"
        />
        {errors.businessName && <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>}
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="address">
          Address
        </label>
        <input
          id="address"
          type="text"
          value={editedAddress}
          onChange={(e) => setEditedAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="phoneNumber">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          value={editedPhoneNumber}
          onChange={(e) => setEditedPhoneNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          maxLength={11}
          aria-describedby="phoneNumberHelp"
        />
        {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
        <p id="phoneNumberHelp" className="text-gray-500 text-xs mt-1">
          Enter an 11-digit phone number (e.g., 08012345678).
        </p>
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="bankCode">
          Bank
        </label>
        <select
          id="bankCode"
          value={editedBankCode}
          onChange={(e) => {
            setEditedBankCode(e.target.value);
            setIsVerified(false); // Reset verification on bank change
          }}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
          aria-required="true"
        >
          <option value="">Select a bank</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
        {errors.bankCode && <p className="text-red-600 text-sm mt-1">{errors.bankCode}</p>}
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="accountNumber">
          Bank Account Number
        </label>
        <div className="flex">
          <input
            id="accountNumber"
            type="text"
            value={editedBankAccountNumber}
            onChange={(e) => {
              setEditedBankAccountNumber(e.target.value);
              setIsVerified(false);
            }}
            className="w-full border border-gray-300 rounded-l-lg p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
            placeholder="Enter your 10-digit account number"
            maxLength={10}
            required
            aria-required="true"
          />
          <button
            type="button"
            onClick={handleVerifyBankAccount}
            disabled={verifying}
            className={`bg-blue-950 text-white px-4 py-2 rounded-r-lg hover:bg-blue-900 transition-colors ${
              verifying ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            aria-label="Verify bank account"
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
        {errors.bankAccountNumber && <p className="text-red-600 text-sm mt-1">{errors.bankAccountNumber}</p>}
      </div>
      <div>
        <label className="block text-gray-700 font-medium" htmlFor="accountName">
          Bank Account Name
        </label>
        <input
          id="accountName"
          type="text"
          value={editedBankAccountName}
          readOnly
          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none"
          placeholder="Verified account name will appear here"
          required
          aria-required="true"
        />
        {isVerified && <p className="text-green-600 text-sm mt-1">Account verified!</p>}
        {errors.bankAccountName && <p className="text-red-600 text-sm mt-1">{errors.bankAccountName}</p>}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          aria-label="Save profile changes"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const VendorDashboardPage = () => {
  const { vendor, banks, loading, error, fetchData, setVendor } = useVendorData();
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (formData: FormData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Error!",
        text: "You must be logged in to update your profile.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => navigate("/auth/login"));
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/vendors/update-vendor-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setVendor(response.data.vendor);
      setShowEditForm(false);
      Swal.fire({
        title: "Success!",
        text: "Vendor profile updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error: any) {
      console.error("Failed to update vendor profile:", error.response?.data || error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update vendor profile. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-950"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <section className="bg-gray-100 flex-grow p-4 sm:p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Welcome, {vendor?.businessName || "Vendor"}!
              </h1>
            </div>
            <button
              onClick={() => navigate("/customer-dashboard")}
              className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors text-sm sm:text-base"
              aria-label="View dashboard as a customer"
            >
              View as Customer
            </button>
          </div>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Manage your vendor profile, products, orders, and chats here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow min-h-[300px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Your Vendor Profile</h2>
              {!showEditForm ? (
                <div className="space-y-2 text-sm sm:text-base flex-grow">
                  <div className="flex justify-center">
                    <img
                      src={vendor?.profilePicture ? `${API_BASE_URL}${vendor.profilePicture}` : "/default-profile.png"}
                      alt={vendor?.businessName || "Vendor Profile"}
                      className="rounded-full h-20 w-20 object-cover border-2 border-blue-950 mb-4"
                      loading="lazy"
                    />
                  </div>
                  <p>
                    <strong>Business Name: </strong>
                    {vendor?.businessName || "Not provided"}
                  </p>
                  <p>
                    <strong>Address: </strong>
                    {vendor?.address || "Not provided"}
                  </p>
                  <p>
                    <strong>Phone Number: </strong>
                    {vendor?.phoneNumber || "Not provided"}
                  </p>
                  <p>
                    <strong>Description: </strong>
                    {vendor?.description || "Not provided"}
                  </p>
                  <p>
                    <strong>Bank Name: </strong>
                    {banks.find((bank) => bank.code === vendor?.bankCode)?.name || "Not provided"}
                  </p>
                  <p>
                    <strong>Bank Account Number: </strong>
                    {vendor?.bankAccountNumber || "Not provided"}
                  </p>
                  <p>
                    <strong>Bank Account Name: </strong>
                    {vendor?.bankAccountName || "Not provided"}
                  </p>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors mt-4 w-full"
                    aria-label="Edit vendor profile"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <EditProfileForm
                  vendor={vendor}
                  banks={banks}
                  onSave={handleUpdateProfile}
                  onCancel={() => setShowEditForm(false)}
                />
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow min-h-[300px] flex flex-col justify-between">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  View and manage your products.
                </p>
              </div>
              <button
                onClick={() => navigate("/vendor/products")}
                className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors w-full"
                aria-label="Manage products"
              >
                Manage/View Products
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow min-h-[300px] flex flex-col justify-between">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Manage Orders & Chats</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  View and manage your orders and chats.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/vendor/orders")}
                  className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors w-full"
                  aria-label="View orders"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate("/vendor/chats")}
                  className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors w-full"
                  aria-label="View chats"
                >
                  View Chats
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VendorDashboardPage;