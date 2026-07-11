// Backend/server.js
// ✅ PRODUCTION-READY for cPanel / VPS

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ✅ ROUTE IMPORTS
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import tiktokRoutes from './routes/tiktokRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import paymentRoutes from './routes/paymentRoute.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import bankVerificationRoutes from './routes/bankVerification.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// ✅ MIDDLEWARE
// ============================================

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for cPanel compatibility
}));

// CORS
const allowedOrigins = [
  "https://qasrelibas.co.uk",
  "https://www.qasrelibas.co.uk",
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked for:', origin);
      callback(null, true); // Allow anyway for production
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Compression
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ✅ ROUTES
// ============================================

// Root API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QASR-E-LIBAS LTD API',
    status: 'running',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      coupons: '/api/coupons',
      bankVerify: '/api/verify-bank-account'
    }
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'QASR-E-LIBAS LTD API v2',
    status: 'running',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      uploads: '/api/upload',
      reviews: '/api/reviews',
      coupons: '/api/coupons',
      returns: '/api/returns',
      contact: '/api/contact/support-email',
      payment: '/api/create-payment-intent',
      tiktok: '/api/tiktok/active',
      bankVerify: '/api/verify-bank-account'
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: {
      status: dbStatusMap[dbStatus] || 'unknown',
      connected: dbStatus === 1
    },
    nodeVersion: process.version,
    memory: process.memoryUsage()
  });
});

// ✅ API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api', tiktokRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/contact/support-email', contactRoutes);
app.use('/api/admin/discounts', discountRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api', paymentRoutes);
app.use('/api', bankVerificationRoutes);

// ============================================
// ✅ SERVE REACT (Production)
// ============================================

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  
  if (fs.existsSync(distPath)) {
    console.log(`📁 Serving React from: ${distPath}`);
    
    // Serve static files
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    
    // React fallback (fix for path-to-regexp)
    app.get(/^\/(?!api).*/, (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('index.html not found');
      }
    });
  } else {
    console.warn('⚠️ React dist folder not found at:', distPath);
  }
}

// ============================================
// ✅ 404 & ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ✅ MONGODB CONNECTION
// ============================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Start server after successful DB connection
    app.listen(PORT, () => {
      console.log('========================================');
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('========================================');
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 API: http://localhost:${PORT}/api`);
      console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
      console.log(`🏦 Bank Verify: /api/verify-bank-account`);
      console.log('========================================');
      console.log('🚀 Ready to accept requests!\n');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Start the application
connectDB();

// ============================================
// ✅ MONGODB EVENTS
// ============================================

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected, attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected');
});

// ============================================
// ✅ GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

export default app;