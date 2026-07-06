// Backend/server.js
// ✅ ADD Bank Verification Routes

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// ✅ Force IPv4 DNS
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ✅ Route Imports
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
import bankVerificationRoutes from './routes/bankVerification.js'; // ✅ ADDED

const app = express();

// ========================================
// ✅ MIDDLEWARE
// ========================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========================================
// ✅ ROUTES - REGISTER ALL ROUTES
// ========================================

// ── Root Route ──
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QASR-E-LIBAS LTD API is running!',
    status: 'Healthy',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      coupons: '/api/coupons',
      bankVerify: '/api/verify-bank-account'
    }
  });
});

// ── API Routes ──
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

// ✅ Bank Verification Routes
app.use('/api', bankVerificationRoutes); // ← YEH IMPORTANT HAI

// ── Payment Routes ──
app.use('/api', paymentRoutes);

// ── Static Files ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// ✅ MONGODB CONNECTION
// ========================================

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', conn.connection.name);
    console.log('🌐 Host:', conn.connection.host);
    
    return conn;
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
    throw err;
  }
};

// ========================================
// ✅ START SERVER
// ========================================

const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('========================================');
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📦 API:    http://localhost:${PORT}/api`);
      console.log(`🔐 Auth:   http://localhost:${PORT}/api/auth`);
      console.log(`🏷️ Coupons: http://localhost:${PORT}/api/coupons`);
      console.log(`🏦 Bank Verify: http://localhost:${PORT}/api/verify-bank-account`);
      console.log('========================================');
      console.log('🚀 Ready to accept requests!\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    setTimeout(startServer, 5000);
  }
};

startServer();