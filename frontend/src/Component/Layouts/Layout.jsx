import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../Footer/Footer';
import CouponBanner from './../Pages/CouponBanner'; // ✅ ADDED
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="layout-wrapper">
      {/* ✅ Coupon Banner - Sirf non-admin pages par show hoga */}
      {!isAdminPage && <CouponBanner />}
      
      <header className="sticky-header">
        <Navbar />
      </header>

      <main className="main-viewport">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;