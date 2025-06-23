import { Routes, Route } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"

import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import CompleteProfilePage from "./pages/CompleteProfilePage"
import CreateVendorProfilePage from "./pages/CreateVendorProfilePage"
import HomePage from "./pages/HomePage"
import VendorDashboardPage from "./dashboards/VendorDashboardPage"
import VendorProductsPage from "./pages/VendorProductsPage"
import EditProductPage from "./pages/EditProductPage"
import ProductListingPage from "./pages/ProductListingPage"
import ProductDetailsPage from "./pages/ProductDetailsPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import LikedProductsPage from "./pages/LikedProductsPage"
import ShoppingCartPage from "./pages/ShoppingCartPage"
import CustomerDashboardPage from "./dashboards/CustomerDashboardPage"
import { CountProvider } from "./contexts/CountContext"
import RecommendedProductsPage from "./pages/RecommendedProductsPage"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <>
    <CountProvider>
      <GoogleOAuthProvider clientId={`${GOOGLE_CLIENT_ID}`} >
        <Routes>
          <Route path="/" element={ <HomePage /> } />
          <Route path="/auth/signup" element={ <SignupPage /> } />
          <Route path="/auth/login" element={ <LoginPage /> } />
          <Route path="/auth/forgot-password" element={ <ForgotPasswordPage /> } />
          <Route path="/auth/reset-password" element={ <ResetPasswordPage /> } />
          <Route path="/auth/complete-profile" element={ <CompleteProfilePage /> } />
          <Route path="/vendors/create-vendor-profile" element={ <CreateVendorProfilePage /> } />
          <Route path="/vendor-dashboard" element={ <VendorDashboardPage /> } />
          <Route path="/vendor/products" element={ <VendorProductsPage /> } />
          <Route path="/vendor/products/edit/:id" element={ <EditProductPage /> } />
          <Route path="/products" element={ <ProductListingPage /> } />
         <Route path="/products/:id" element={ <ProductDetailsPage /> } />
         <Route path="/auth/verify-email" element={ <VerifyEmailPage /> } />
         <Route path="/liked-products" element={ <LikedProductsPage /> } />
         <Route path="/shopping-cart" element={ <ShoppingCartPage /> } />
         <Route path="/customer-dashboard" element={ <CustomerDashboardPage /> } />
         <Route path="/recommended-products" element={<RecommendedProductsPage />} />
        </Routes>
      </GoogleOAuthProvider>
      </CountProvider>
    </>
  )
}

export default App
