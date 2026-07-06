import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/upload.js';
import { memoryUpload } from '../middleware/uploadMemory.js';
import { addProductWithCloudinary } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { MAX_PRODUCT_IMAGES, BRAND_NAME } from '../config/constants.js';

const router = express.Router();

// Cloudinary upload route — stores only secure URLs in MongoDB
router.post('/add', protect, admin, memoryUpload.array('images', MAX_PRODUCT_IMAGES), addProductWithCloudinary);

// ========== HELPER FUNCTION: Generate Unique SKU ==========
const generateUniqueSKU = async () => {
  const prefix = 'QLIB';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  let sku = `${prefix}-${timestamp}-${random}`;
  
  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return generateUniqueSKU(); // Recursively generate new one
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
  
  // If rentalData is a string (JSON string from FormData), parse it
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
  
  // If it's already an object, use it directly
  return {
    available: rentalData.available === true,
    pricePerDay: Number(rentalData.pricePerDay) || 0,
    deposit: Number(rentalData.deposit) || 0
  };
};

// ========== HELPER FUNCTION: Parse JSON Fields ==========
const parseJSONField = (field, defaultValue = null) => {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error(`Error parsing JSON field:`, error);
      return defaultValue;
    }
  }
  return field;
};

// Get all products (with rental filters)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort, 
      type, 
      listingType,
      rentalAvailable,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all' && category !== 'undefined') {
      query.category = category;
      console.log(`Filtering by category: ${category}`);
    }
    
    // Filter by type (shoes, jewelry, etc.)
    if (type && type !== 'all' && type !== 'undefined') {
      query.type = type;
    }
    
    // Filter by listing type (sale, rental, or both)
    if (listingType && listingType !== 'all' && listingType !== 'undefined') {
      if (listingType === 'rental') {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { listingType: 'rental' },
            { listingType: 'both' },
            { listingType: 'sale', 'rental.available': true },
          ],
        });
      } else {
        query.listingType = listingType;
      }
    }
    
    // ✅ Filter by rental availability
    if (rentalAvailable === 'true') {
      query.listingType = 'rental';
      query['rental.available'] = true;
    }
    
    // Search by product name or SKU
    if (search && search.trim()) {
      const term = search.trim();
      const searchRegex = { $regex: term, $options: 'i' };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: searchRegex },
          { sku: searchRegex },
          { description: searchRegex },
        ],
      });
    }
    
    console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    
    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get rental products only
router.get('/rentals', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { 
      isActive: true,
      listingType: 'rental',
      'rental.available': true
    };
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get rental products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category (Men's or Women's)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { sort, listingType } = req.query;
    
    // Validate category
    const validCategories = ['women', 'men', 'kids', 'jewelry', 'shoes', 'accessories', 'traditional'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      });
    }
    
    let query = { 
      isActive: true,
      category: category 
    };
    
    // ✅ Filter by listing type
    if (listingType && listingType !== 'all') {
      query.listingType = listingType;
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    
    const products = await Product.find(query).sort(sortOption);
    
    console.log(`Found ${products.length} products in category: ${category}`);
    
    res.json({
      success: true,
      category: category,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && product.isActive !== false) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product (short URL alias)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findById(id);
    if (product && product.isActive !== false) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Calculate rental cost endpoint
router.post('/product/:id/calculate-rental', async (req, res) => {
  try {
    const { days } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.listingType !== 'rental' || !product.rental.available) {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }
    
    if (!days || days < 1) {
      return res.status(400).json({ message: 'Invalid number of days' });
    }
    
    const rentalCost = product.rental.pricePerDay * days;
    const totalWithDeposit = rentalCost + product.rental.deposit;
    
    res.json({
      success: true,
      days,
      pricePerDay: product.rental.pricePerDay,
      deposit: product.rental.deposit,
      rentalCost,
      total: totalWithDeposit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create product (Admin) - WITH RENTAL SUPPORT
router.post('/', protect, admin, upload.array('images', MAX_PRODUCT_IMAGES), async (req, res) => {
  try {
    console.log('=== CREATING PRODUCT ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files?.length || 0);
    
    // Process images
    const uploadedImages = req.files ? req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      publicId: file.filename,
      isMain: index === 0 // First image is main
    })) : [];
    
    // If no images, add default
    if (uploadedImages.length === 0) {
      uploadedImages.push({
        url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
        publicId: 'default',
        isMain: true
      });
    }
    
    // ✅ Parse JSON fields
    const sizes = parseJSONField(req.body.sizes, []);
    const colors = parseJSONField(req.body.colors, []);
    const measurementFields = parseJSONField(req.body.measurementFields, {
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
    });
    
    // ✅ Parse rental configuration
    const rentalConfig = parseRentalConfig(req.body.rental);
    const listingType = req.body.listingType || 'sale';
    
    // ✅ Handle SKU - generate if not provided
    let sku = req.body.sku;
    if (!sku || sku === 'null' || sku === '' || sku === 'undefined') {
      sku = await generateUniqueSKU();
      console.log('📦 Generated SKU:', sku);
    } else {
      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product with this SKU already exists' 
        });
      }
    }
    
    // Use category field (not gender)
    let category = req.body.category || 'traditional';
    
    // Create product with rental fields
    const product = new Product({
      sku: sku,
      name: req.body.name,
      description: req.body.description || `${req.body.name} - Beautiful product`,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : 0,
      category: category,
      stock: parseInt(req.body.stock) || 0,
      sizes: sizes,
      colors: colors,
      images: uploadedImages,
      material: req.body.material || '',
      brand: req.body.brand || BRAND_NAME,
      careInstructions: req.body.careInstructions || '',
      origin: req.body.origin || '',
      style: req.body.style || '',
      sleeveLength: req.body.sleeveLength || '',
      isFeatured: req.body.isFeatured === 'true',
      isActive: true,
      requiresMeasurements: req.body.requiresMeasurements === 'true',
      measurementFields: measurementFields,
      // ✅ RENTAL FIELDS
      listingType: listingType,
      isRental: listingType === 'rental',
      rental: rentalConfig
    });
    
    const createdProduct = await product.save();
    console.log(`✅ Product created successfully!`);
    console.log(`   ID: ${createdProduct._id}`);
    console.log(`   SKU: ${createdProduct.sku}`);
    console.log(`   Category: ${createdProduct.category}`);
    console.log(`   Type: ${createdProduct.listingType}`);
    if (createdProduct.listingType === 'rental') {
      console.log(`   Rental: ${createdProduct.rental.available ? 'Available' : 'Not available'}`);
      console.log(`   Price/Day: ₹${createdProduct.rental.pricePerDay}`);
      console.log(`   Deposit: ₹${createdProduct.rental.deposit}`);
    }
    
    res.status(201).json({
      success: true,
      product: createdProduct
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate SKU error
    if (error.code === 11000 && error.keyPattern?.sku) {
      return res.status(400).json({ 
        success: false, 
        message: 'SKU already exists. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Update product (Admin) - WITH RENTAL SUPPORT
router.put('/:id', protect, admin, upload.array('images', MAX_PRODUCT_IMAGES), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // ✅ Handle SKU update if provided
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product with this SKU already exists' 
        });
      }
      product.sku = req.body.sku;
    }
    
    // Update basic fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = parseFloat(req.body.price);
    if (req.body.discountPrice !== undefined) product.discountPrice = parseFloat(req.body.discountPrice);
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock);
    if (req.body.description) product.description = req.body.description;
    if (req.body.material !== undefined) product.material = req.body.material;
    if (req.body.brand) product.brand = req.body.brand;
    if (req.body.careInstructions !== undefined) product.careInstructions = req.body.careInstructions;
    if (req.body.origin !== undefined) product.origin = req.body.origin;
    if (req.body.style !== undefined) product.style = req.body.style;
    if (req.body.sleeveLength !== undefined) product.sleeveLength = req.body.sleeveLength;
    if (req.body.requiresMeasurements !== undefined) product.requiresMeasurements = req.body.requiresMeasurements === 'true';
    
    // Parse and update JSON fields
    if (req.body.sizes) product.sizes = parseJSONField(req.body.sizes, []);
    if (req.body.colors) product.colors = parseJSONField(req.body.colors, []);
    if (req.body.measurementFields) {
      product.measurementFields = parseJSONField(req.body.measurementFields, product.measurementFields);
    }
    
    // ✅ Update rental fields
    if (req.body.listingType) {
      product.listingType = req.body.listingType;
      product.isRental = req.body.listingType === 'rental';
    }
    
    if (req.body.rental) {
      product.rental = parseRentalConfig(req.body.rental);
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        publicId: file.filename,
        isMain: product.images.length === 0 && index === 0
      }));
      product.images = [...product.images, ...newImages];
    }
    
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured === 'true';
    if (req.body.isActive !== undefined) product.isActive = req.body.isActive === 'true';
    
    const updatedProduct = await product.save();
    
    console.log(`✅ Product updated successfully: ${updatedProduct._id}`);
    if (updatedProduct.listingType === 'rental') {
      console.log(`   Rental: ${updatedProduct.rental.available ? 'Available' : 'Not available'}`);
      console.log(`   Price/Day: ₹${updatedProduct.rental.pricePerDay}`);
    }
    
    res.json({ success: true, product: updatedProduct });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Delete product (soft delete)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.isActive = false;
    await product.save();
    
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;