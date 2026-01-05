import "./App.css";

import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import useAuthStore from "./stores/authStore";

import Landing from "./pages/landing/landing";
import Auth from "./pages/auth/auth";
import VerifyOTP from "./pages/signUp/verifyOTP";
import ForgotPassword from "./pages/forgotPassword/forgotPassword";
import SearchPage from "./pages/search/search";
import ProductPage from "./pages/product/product";
import ProfileSettingsBasicInfo from "./pages/profile/settings";
import ProfileMyBids from "./pages/profile/myBids";
import ProfileMyReviews from "./pages/profile/reviews";
import ProfileFavorites from "./pages/profile/favorites";
import ProductSellerPage from "./pages/profile/selling/productSeller";
import CreateAuction from "./pages/profile/selling/createProdForSell";
import EditAuction from "./pages/profile/selling/editProdForSell";
import ProtectedRoute from "./pages/ProtectedRoute";

import UserManagementTab from "./pages/admin/user/user";
import ProductManagementTab from "./pages/admin/product/product";
import CategoryManagementTab from "./pages/admin/category/category";
import RequestsManagementTab from "./pages/admin/upgradeRequests/requests";
import BidderTransactionPage from "./pages/transaction/transactionBidder";
import SellerTransactionPage from "./pages/transaction/transactionSeller";
import MainLayout from "./components/layout/MainLayout";

export default function App() {
  const { user, refresh } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Always try to refresh token on app mount
        // This ensures accessToken is valid even after page refresh
        if (user) {
          await refresh();
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Don't render routes until auth is initialized
  if (!isInitialized) {
    return <div></div>;
  }
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            {/* Common */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signIn" element={<Navigate to="/auth" replace />} />
            <Route path="/signUp" element={<Navigate to="/auth" replace />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Redirects for admin dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/user" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin/user" replace />} />

            <Route path="/admin/user" element={<UserManagementTab />} />
            <Route path="/admin/product" element={<ProductManagementTab />} />
            <Route path="/admin/category" element={<CategoryManagementTab />} />
            <Route path="/admin/requests" element={<RequestsManagementTab />} />
            <Route path="/transactions/bidder/:id" element={<BidderTransactionPage />} />
            <Route path="/transactions/seller/:id" element={<SellerTransactionPage />} />
            <Route path="/transactions/:id/bidder" element={<BidderTransactionPage />} />
            <Route path="/transactions/:id/seller" element={<SellerTransactionPage />} />

            <Route path="/product/:id" element={<ProductPage />} />

            {/* protected route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route
                path="/profile/settings"
                element={<ProfileSettingsBasicInfo />}
              />
              <Route path="/profile/bids" element={<ProfileMyBids />} />
              <Route path="/profile/reviews" element={<ProfileMyReviews />} />
              <Route path="/profile/favorites" element={<ProfileFavorites />} />
              <Route path="/profile/sellings" element={<ProductSellerPage />} />
              <Route path="/profile/sellings/edit/:id" element={<EditAuction />} />

              {/* Seller Page */}
              <Route path="/productSeller" element={<ProductSellerPage />} />
              <Route path="/createProduct" element={<CreateAuction />} />
              <Route path="/product/:id/edit" element={<EditAuction />} />
            </Route>


            {/* Catch all Error Page*/}
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  );
}