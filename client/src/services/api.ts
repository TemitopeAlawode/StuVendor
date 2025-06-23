/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// API for fetching Bank List
export const getBanks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/vendors/banks`);
        console.log('List of banks', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch banks:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to load bank list.',
            icon: 'error',
        });
        return []; //Return empty array
    }
}


// API for verifying bank account by the account number
export const verifyBankAccount = async (bankAccountNumber: string, bankCode: string) => {
    if (bankAccountNumber.length !== 10 || !bankCode) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select a bank and enter a 10-digit account number.',
            icon: 'error',
        });
        return;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/vendors/verify-bank-account`, {
            bankAccountNumber,
            bankCode
        });

        Swal.fire({
            title: 'Success!',
            text: `Account verified: ${response.data.bankAccountName}`,
            icon: 'success',
        });

        return (response.data.bankAccountName);
    } catch (error: any) {
        console.error('Verification failed:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to verify account.',
            icon: 'error',
        });
        return;
    }

}


// API for fetching 
