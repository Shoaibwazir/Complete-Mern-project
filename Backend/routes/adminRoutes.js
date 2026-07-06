import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpe?g|png|gif|webp|heic|heif|bmp|tiff?/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const hasValidExt = ext ? allowed.test(ext) : false;
  const hasValidMime =
    file.mimetype &&
    (file.mimetype.startsWith('image/') || allowed.test(file.mimetype));

  if (hasValidExt || hasValidMime) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed'));
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 25 },
  fileFilter: fileFilter
});

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// ========== HELPER FUNCTION: Generate Unique SKU ==========
const generateUniqueSKU = async () => {
  const prefix = 'QLIB';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  let sku = `${prefix}-${timestamp}-${random}`;
  
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return generateUniqueSKU();
  }
  return sku;
};

// ========== HELPER FUNCTION: Parse Rental Configuration ==========
const parseRentalConfig = (rentalData) => {
  if (!rentalData) {
    return {
      available: false,
      pricePerDay: 0,
      deposit: 0
    };
  }
  
  if (typeof rentalData === 'string') {
    try {
      const parsed = JSON.parse(rentalData);
      return {
        available: parsed.available === true,
        pricePerDay: Number(parsed.pricePerDay) || 0,
        deposit: Number(parsed.deposit) || 0
      };
    } catch (error) {
      console.error('Error parsing rental config:', error);
      return {
        available: false,
        pricePerDay: 0,
        deposit: 0
      };
    }
  }
  
  return {
    available: rentalData.available === true,
    pricePerDay: Number(rentalData.pricePerDay) || 0,
    deposit: Number(rentalData.deposit) || 0
  };
};

// ========== HELPER FUNCTION: Generate Report HTML ==========
const generateReportHTML = (reportData) => {
  const { period, totalSales, totalOrders, totalUsers, averageOrderValue, salesData } = reportData;

  let salesTableRows = '';
  if (salesData && salesData.length > 0) {
    salesTableRows = salesData.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.date}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">£${item.sales || 0}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.orders || 0}</td>
      </tr>
    `).join('');
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Store Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #c6a43f, #a8892e); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
        .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-box { background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #c6a43f; }
        .stat-value { font-size: 28px; font-weight: bold; color: #c6a43f; }
        .stat-label { color: #666; margin-top: 5px; font-size: 14px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin: 25px 0 15px; border-bottom: 2px solid #c6a43f; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        thead { background: #c6a43f; color: white; }
        th { padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f9f6f0; }
        .footer { text-align: center; padding: 20px; background: #f8f8f8; border-top: 1px solid #eee; font-size: 12px; color: #999; }
        .footer strong { color: #c6a43f; }
        .badge { display: inline-block; background: #c6a43f; color: white; padding: 3px 12px; border-radius: 20px; font-size: 12px; }
        @media (max-width: 600px) {
          .stats { grid-template-columns: 1fr; }
          .container { border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 QASR-E-LIBAS Store Report</h1>
          <p>Period: <strong>${period}</strong> • Generated: ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div class="content">
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">£${(totalSales || 0).toLocaleString()}</div>
              <div class="stat-label">💰 Total Revenue</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalOrders || 0}</div>
              <div class="stat-label">📦 Total Orders</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalUsers || 0}</div>
              <div class="stat-label">👤 Total Customers</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">£${(averageOrderValue || 0).toFixed(2)}</div>
              <div class="stat-label">📈 Avg Order Value</div>
            </div>
          </div>

          ${salesData && salesData.length > 0 ? `
            <div class="section-title">📋 Sales Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th style="text-align: right;">Sales (£)</th>
                  <th style="text-align: center;">Orders</th>
                </tr>
              </thead>
              <tbody>
                ${salesTableRows}
              </tbody>
            </table>
          ` : '<p style="color: #999; text-align: center;">No sales data available for this period</p>'}

          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
            <span class="badge">📈 Report</span> 
            Generated automatically from store data
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <strong>QASR-E-LIBAS Ltd</strong>. All rights reserved.</p>
          <p style="margin: 0; color: #bbb;">This is an automated report from your store dashboard</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ========== DASHBOARD STATS ==========
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const rentalProducts = await Product.countDocuments({ listingType: 'rental', isActive: true });
    const availableRentals = await Product.countDocuments({ 
      listingType: 'rental', 
      'rental.available': true,
      isActive: true 
    });
    
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);
    
    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      recentOrders,
      lowStockProducts,
      rentalProducts,
      availableRentals
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== REPORTS ENDPOINT ==========
router.get('/reports', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: now }
    });
    
    const salesMap = new Map();
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateStr = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      salesMap.set(dateStr, { date: dateStr, sales: 0, orders: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    orders.forEach(order => {
      const dateStr = order.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (salesMap.has(dateStr)) {
        const data = salesMap.get(dateStr);
        data.sales += order.totalPrice;
        data.orders += 1;
        salesMap.set(dateStr, data);
      }
    });
    
    const salesData = Array.from(salesMap.values());
    
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const topCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { 
          _id: '$user', 
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);
    
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$orderItems' },
      { $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);
    
    const topCategories = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$orderItems' },
      { $lookup: { from: 'products', localField: 'orderItems.product', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: '$product.category',
          totalSold: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
    
    res.json({
      success: true,
      totalSales,
      totalOrders: orders.length,
      totalUsers,
      averageOrderValue,
      salesData,
      customerData: {
        totalCustomers: totalUsers,
        newCustomers: newUsers,
        returningCustomers: Math.max(0, totalUsers - newUsers),
        inactiveCustomers: 0,
        customerGrowth: 0,
        topCustomers
      },
      productStats: {
        topProducts,
        topCategories
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== SEND EMAIL REPORT - REAL EMAIL VERSION ==========
router.post('/send-report', async (req, res) => {
  try {
    const { to, subject, reportData } = req.body;

    console.log('📧 Sending report to:', to);

    // Validate required fields
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email is required' 
      });
    }
    
    if (!reportData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report data is required' 
      });
    }

    // ✅ REAL EMAIL SENDING - Uncomment this section
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Using simulated email.');
      
      // Simulated mode
      console.log('📧 Email Report (Simulated):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Total Sales:', reportData.totalSales);
      console.log('Total Orders:', reportData.totalOrders);
      console.log('Total Customers:', reportData.totalUsers);
      
      return res.status(200).json({
        success: true,
        message: 'Report sent successfully (simulated)',
        simulated: true
      });
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter connection
    await transporter.verify();
    console.log('✅ Email transporter verified');

    // Generate HTML email content
    const emailHTML = generateReportHTML(reportData);

    const mailOptions = {
      from: `"QASR-E-LIBAS Reports" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject || `Store Report - ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      html: emailHTML,
      text: `Store Report - Period: ${reportData.period}\n\nTotal Sales: £${reportData.totalSales}\nTotal Orders: ${reportData.totalOrders}\nTotal Customers: ${reportData.totalUsers}\nAverage Order Value: £${reportData.averageOrderValue}\n\nGenerated on ${new Date().toLocaleString()}`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Report sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Send report error:', error);
    
    // If email fails, fallback to simulated mode
    console.log('📧 Falling back to simulated mode due to error');
    res.status(200).json({
      success: true,
      message: 'Report processed (simulated)',
      simulated: true,
      error: error.message
    });
  }
});

// ========== PRODUCT MANAGEMENT ==========
// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get rental products only
router.get('/products/rentals', async (req, res) => {
  try {
    const rentalProducts = await Product.find({ 
      listingType: 'rental',
      isActive: true 
    }).sort({ createdAt: -1 });
    res.json(rentalProducts);
  } catch (error) {
    console.error('Get rental products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create product with image upload - WITH RENTAL SUPPORT
router.post('/products', upload.array('images', 25), async (req, res) => {
  try {
    console.log('📦 Received product data:', req.body);
    console.log('📸 Received files:', req.files?.length || 0);
    
    const { name, price, description, category, stock, listingType } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!price) {
      return res.status(400).json({ success: false, message: 'Price is required' });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = `http://localhost:5000/uploads/${file.filename}`;
        imageUrls.push({
          url: imageUrl,
          publicId: file.filename,
          isMain: imageUrls.length === 0
        });
      }
    } else {
      imageUrls.push({ 
        url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400', 
        publicId: 'default',
        isMain: true
      });
    }
    
    let sizes = [];
    let colors = [];
    
    try {
      sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
      colors = req.body.colors ? JSON.parse(req.body.colors) : [];
    } catch (parseError) {
      sizes = [];
      colors = [];
    }
    
    let measurementFields = {};
    try {
      measurementFields = req.body.measurementFields ? JSON.parse(req.body.measurementFields) : {
        bust: true,
        waist: true,
        hips: true,
        shoulder: false,
        armLength: false,
        thigh: false,
        calf: false,
        height: true,
        weight: false,
        customNotes: true
      };
    } catch (parseError) {
      measurementFields = {
        bust: true,
        waist: true,
        hips: true,
        shoulder: false,
        armLength: false,
        thigh: false,
        calf: false,
        height: true,
        weight: false,
        customNotes: true
      };
    }
    
    const rentalConfig = parseRentalConfig(req.body.rental);
    const productListingType = listingType || 'sale';
    
    let sku = req.body.sku;
    if (!sku || sku === 'null' || sku === '' || sku === 'undefined') {
      sku = await generateUniqueSKU();
      console.log('📦 Generated SKU:', sku);
    }
    
    const productData = {
      sku: sku,
      name: name,
      price: Number(price),
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : 0,
      description: description,
      category: category,
      stock: Number(stock),
      sizes: sizes,
      colors: colors,
      images: imageUrls,
      isActive: true,
      material: req.body.material || '',
      brand: req.body.brand || 'QASR-E-LIBAS LTD',
      careInstructions: req.body.careInstructions || '',
      origin: req.body.origin || '',
      style: req.body.style || '',
      sleeveLength: req.body.sleeveLength || '',
      requiresMeasurements: req.body.requiresMeasurements === 'true',
      measurementFields: measurementFields,
      listingType: productListingType,
      isRental: productListingType === 'rental',
      rental: rentalConfig
    };
    
    const product = await Product.create(productData);
    
    console.log('✅ Product created successfully:', product._id, 'SKU:', product.sku, 'Type:', product.listingType);
    res.status(201).json({ 
      success: true, 
      message: 'Product added successfully',
      product: product 
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    
    if (error.code === 11000 && error.keyPattern?.sku) {
      try {
        const newSKU = await generateUniqueSKU();
        
        const { name, price, description, category, stock, listingType } = req.body;
        
        let sizes = [];
        let colors = [];
        try {
          sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
          colors = req.body.colors ? JSON.parse(req.body.colors) : [];
        } catch (parseError) {
          sizes = [];
          colors = [];
        }
        
        let measurementFields = {};
        try {
          measurementFields = req.body.measurementFields ? JSON.parse(req.body.measurementFields) : {};
        } catch (parseError) {
          measurementFields = {};
        }
        
        const rentalConfig = parseRentalConfig(req.body.rental);
        const productListingType = listingType || 'sale';
        
        const product = await Product.create({
          sku: newSKU,
          name: name,
          price: Number(price),
          discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : 0,
          description: description,
          category: category,
          stock: Number(stock),
          sizes: sizes,
          colors: colors,
          images: imageUrls,
          isActive: true,
          material: req.body.material || '',
          brand: req.body.brand || 'QASR-E-LIBAS LTD',
          careInstructions: req.body.careInstructions || '',
          origin: req.body.origin || '',
          style: req.body.style || '',
          sleeveLength: req.body.sleeveLength || '',
          requiresMeasurements: req.body.requiresMeasurements === 'true',
          measurementFields: measurementFields,
          listingType: productListingType,
          isRental: productListingType === 'rental',
          rental: rentalConfig
        });
        
        return res.status(201).json({ 
          success: true, 
          message: 'Product added successfully (retry with new SKU)',
          product: product 
        });
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create product after retry',
          error: retryError.message
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update product - WITH RENTAL SUPPORT
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const rentalConfig = req.body.rental ? parseRentalConfig(req.body.rental) : product.rental;
    const listingType = req.body.listingType || product.listingType;
    
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.discountPrice = req.body.discountPrice !== undefined ? req.body.discountPrice : product.discountPrice;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.sizes = req.body.sizes || product.sizes;
    product.colors = req.body.colors || product.colors;
    product.material = req.body.material || product.material;
    product.brand = req.body.brand || product.brand;
    product.careInstructions = req.body.careInstructions || product.careInstructions;
    product.origin = req.body.origin || product.origin;
    product.style = req.body.style || product.style;
    product.sleeveLength = req.body.sleeveLength || product.sleeveLength;
    product.requiresMeasurements = req.body.requiresMeasurements !== undefined ? req.body.requiresMeasurements : product.requiresMeasurements;
    
    if (req.body.measurementFields) {
      try {
        product.measurementFields = typeof req.body.measurementFields === 'string' 
          ? JSON.parse(req.body.measurementFields) 
          : req.body.measurementFields;
      } catch (e) {
        console.error('Error parsing measurementFields:', e);
      }
    }
    
    product.listingType = listingType;
    product.isRental = listingType === 'rental';
    product.rental = rentalConfig;
    
    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      for (const image of product.images) {
        const imagePath = path.join(uploadDir, path.basename(image.url));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      await product.deleteOne();
      res.json({ success: true, message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete products
router.delete('/products/bulk/delete', async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !productIds.length) {
      return res.status(400).json({ message: 'No products selected' });
    }
    
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const product of products) {
      for (const image of product.images) {
        const imagePath = path.join(uploadDir, path.basename(image.url));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    
    await Product.deleteMany({ _id: { $in: productIds } });
    res.json({ success: true, message: `${productIds.length} products removed successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== ORDER MANAGEMENT ==========
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (order) {
      order.status = status;
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== USER MANAGEMENT ==========
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (user.isAdmin && adminCount === 1) {
        return res.status(400).json({ message: 'Cannot delete the only admin user' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== CHART DATA ==========
router.get('/chart-data', async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }
    
    const salesData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const orders = await Order.find({
          createdAt: { $gte: date, $lt: nextDay }
        });
        
        const total = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const count = orders.length;
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: total,
          orders: count
        };
      })
    );
    
    res.json({ daily: salesData });
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== RENTAL STATS ENDPOINT ==========
router.get('/rental-stats', async (req, res) => {
  try {
    const totalRentalProducts = await Product.countDocuments({ listingType: 'rental' });
    const availableRentals = await Product.countDocuments({ 
      listingType: 'rental', 
      'rental.available': true 
    });
    const unavailableRentals = totalRentalProducts - availableRentals;
    
    const highValueRentals = await Product.find({ 
      listingType: 'rental',
      'rental.pricePerDay': { $gt: 5000 }
    }).select('name rental.pricePerDay');
    
    res.json({
      success: true,
      totalRentalProducts,
      availableRentals,
      unavailableRentals,
      highValueRentals: highValueRentals.length,
      topRentals: highValueRentals
    });
  } catch (error) {
    console.error('Rental stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== EXPORT ==========
const adminRouter = router;
export default adminRouter;