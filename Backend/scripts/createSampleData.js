import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './../models/User.js';
import Product from './../models/Product.js';
import Order from './../models/Order.js';

dotenv.config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@fancyimpress.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      await User.create({
        name: 'Admin User',
        email: 'admin@fancyimpress.com',
        password: await bcrypt.hash('Admin@123', salt),
        isAdmin: true
      });
      console.log('✅ Admin user created');
    }
    
    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        { name: 'Classic Denim Jacket', price: 89.99, stock: 25, category: 'men', rating: 4.5, images: [{ url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400' }] },
        { name: 'Premium Cotton Shirt', price: 49.99, stock: 50, category: 'men', rating: 4.8, images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' }] },
      ]);
      console.log('✅ Sample products created');
    }
    
    console.log('✅ Sample data setup complete!');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createSampleData();