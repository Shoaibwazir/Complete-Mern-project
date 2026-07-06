import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import Layout from './Component/Layouts/Layout'
import AuthLayout from './Component/Layouts/AuthLayout'
import HomePage from './Component/Pages/HomePage'
import ProductPage from './Component/Pages/ProductPage'
import CartPage from './Component/Pages/CartPage'
import RegisterPage from './Component/Pages/RegisterPage'
import LoginPage from './Component/Pages/LoginPage'
import ShippingPage from './Component/Pages/ShippingPage'
import CategoryShopPage from './Component/Pages/CategoryShopPage'
import CheckoutPage from './Component/Pages/CheckoutPage'
import ContactPage from './Component/Pages/ContactPage'
import RentalShopPage from './Component/Pages/RentalShopPage'
import Footer from './Component/Layouts/Footer'
import Returns from './Component/Pages/Returns'
import Terms from './Component/Pages/Terms'
import Privacy from './Component/Pages/Privacy'
import ForgotPassword from './Component/Pages/ForgotPassword'
import SearchPage from './Component/Pages/SearchPage'
import TrackingPage from './Component/Pages/TrackingPage'
import RentalAgreement from './Component/Pages/RentalAgreement'

import AdminDashboard from './Component/Pages/admin/AdminDashboard'
import AdminOrders from './Component/Pages/admin/AdminOrders'
import AdminProducts from './Component/Pages/admin/AdminProducts'
import AdminAddProduct from './Component/Pages/admin/AdminAddProduct'
import ControlUser from './Component/Pages/admin/ControlUser'
import PrivateRoute from './Component/Pages/admin/PrivateRoute'
import ProfilePage from './Component/Pages/admin/ProfilePage'
import OrderDetails from './Component/Pages/admin/OrderDetails'
import AdminSettings from './Component/Pages/admin/AdminSettings'
import AdminReports from './Component/Pages/admin/AdminReports'
import AdminDiscounts from './Component/Pages/admin/AdminDiscounts'
import AdminReviews from './Component/Pages/admin/AdminReviews'
import OrderConfirmation from './Component/Pages/admin/OrderConfirmation'
import AdminAddWomenProduct from './Component/Pages/admin/AdminAddWomenProduct'
import AdminAddMenProduct from './Component/Pages/admin/AdminAddMenProduct'
import AdminTikTok from './Component/Pages/admin/AdminTikTok'; 
import AdminEditProduct from './Component/Pages/admin/AdminEditProduct';
import AdminOrderDetail from './Component/Pages/admin/AdminOrderDetail';
import BankAccounts from './Component/Pages/admin/BankAccounts'

// ✅ ADDED: Coupon Banner Component
import CouponBanner from './Component/Pages/CouponBanner';

import './App.css'

const stripePromise = loadStripe('pk_test_your_key_here')

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Elements stripe={stripePromise}>
        <Routes>
          {/* Auth pages — navbar for browsing without login */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="womens" element={<CategoryShopPage categoryKey="women" />} />
            <Route path="mens" element={<CategoryShopPage categoryKey="men" />} />
            <Route path="accessories" element={<CategoryShopPage categoryKey="accessories" />} />
            <Route path="accessories/shoes-sandals" element={<CategoryShopPage categoryKey="shoes" />} />
            <Route path="accessories/jewellery" element={<CategoryShopPage categoryKey="jewelry" />} />
            <Route path="shop/:categoryKey" element={<CategoryShopPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="shipping-delivery" element={<ShippingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="rental-shop" element={<RentalShopPage />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="admin/add-women-product" element={<AdminAddWomenProduct />} />
            <Route path="admin/add-men-product" element={<AdminAddMenProduct />} />
            <Route path="/admin/tiktok" element={<AdminTikTok />} />
            <Route path="footer" element={<Footer />} />
            <Route path="returns" element={<Returns />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="track" element={<TrackingPage />} />
            <Route path="/admin/edit-product/:id" element={<AdminEditProduct />} />
            <Route path="/rental-agreement" element={<RentalAgreement />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="bank-accounts" element={<BankAccounts />} />
          </Route>

          <Route path="/admin">
            <Route
              path="dashboard"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="orders"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <PrivateRoute adminOnly={true}>
                  <OrderDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="products"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="add-product"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminAddProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="control-user"
              element={
                <PrivateRoute adminOnly={true}>
                  <ControlUser />
                </PrivateRoute>
              }
            />
            <Route
              path="settings"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="reports"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminReports />
                </PrivateRoute>
              }
            />
            <Route
              path="discounts"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminDiscounts />
                </PrivateRoute>
              }
            />
            <Route
              path="reviews"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminReviews />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Elements>
    </>
  )
}

export default App
