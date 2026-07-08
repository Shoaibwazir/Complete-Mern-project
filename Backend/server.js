// Backend/server.js
// ✅ PRODUCTION-READY for Vercel

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ✅ MIDDLEWARE
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    "https://qasrelibas.co.uk",
    "https://www.qasrelibas.co.uk"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QASR-E-LIBAS LTD API',
    status: 'running',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

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

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ✅ MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  family: 4
})
.then(() => {
  console.log('✅ MongoDB Connected');

  // Local development only - Vercel does not need app.listen()
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Failed:', err.message);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

// ✅ Graceful Shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => process.exit(0));
});

// ✅ EXPORT FOR VERCEL
export default app;