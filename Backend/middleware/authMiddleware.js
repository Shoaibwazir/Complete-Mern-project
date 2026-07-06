// middleware/authMiddleware.js

import User from '../models/User.js';
import { verifyToken } from '../utils/jwtHelper.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      
      // ✅ Add timeout for database query
      const user = await User.findById(decoded.id)
        .select('-password -__v')
        .maxTimeMS(5000) // ✅ 5 second timeout for query
        .lean(); // ✅ Faster query with lean()
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, user not found' 
        });
      }

      req.user = user;
      req.userId = user._id;
      req.token = token;

      return next();
      
    } catch (error) {
      console.error('❌ Token verification error:', error.message);
      
      if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
        return res.status(503).json({
          success: false,
          message: 'Database connection issue. Please try again later.',
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
          expired: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token',
  });
};

export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, user not authenticated',
    });
  }

  if (req.user.isAdmin) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Not authorized as an admin. Admin access required.',
  });
};

export const protectAdmin = [protect, admin];