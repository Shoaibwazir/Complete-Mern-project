import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './AuthLayout.css';

const AuthLayout = () => (
  <div className="auth-layout-wrapper">
    <header className="sticky-header">
      <Navbar />
    </header>
    <main className="auth-layout-main">
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
