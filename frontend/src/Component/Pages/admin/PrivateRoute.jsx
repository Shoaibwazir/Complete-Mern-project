import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Not logged in
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if admin access required
  if (adminOnly && !userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;