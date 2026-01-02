import "./App.css";

import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { Toaster } from "sonner";

import Landing from "./pages/landing/landing";
import SignIn from "./pages/signIn/signIn";
import SignUp from "./pages/signUp/signUp";
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
import ProtectedRoute from "./pages/ProtectedRoute";
import UserManagementTab from "./pages/admin/user/user";
import ProductManagementTab from "./pages/admin/product/product";
import CategoryManagementTab from "./pages/admin/category/category";
import RequestsManagementTab from "./pages/admin/upgradeRequests/requests";
import BidderTransactionPage from "./pages/transaction/transactionBidder";
import SellerTransactionPage from "./pages/transaction/transactionSeller";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Common */}
          <Route path="/" element={<Landing />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/*Route needing integration, putting it here for testing*/}
          <Route path="/admin/user" element={<UserManagementTab />} />
          <Route path="/admin/product" element={<ProductManagementTab />} />
          <Route path="/admin/category" element={<CategoryManagementTab />} />
          <Route path="/admin/requests" element={<RequestsManagementTab />} />

          {/* Redirects for admin dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/user" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/user" replace />} />
          <Route path="/transactions/bidder/:id" element={<BidderTransactionPage />} />
          <Route path="/transactions/seller/:id" element={<SellerTransactionPage />} />

          {/*Testing Routes*/}
          {/*None*/}

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

            {/* Seller Page */}
            <Route path="/productSeller" element={<ProductSellerPage />} />
            <Route path="/createProduct" element={<CreateAuction />} />
          </Route>

          {/* Catch all Error Page*/}
        </Routes>
      </BrowserRouter>
    </>
  );
}
