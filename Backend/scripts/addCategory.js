import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const addCategoriesToProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products without category
    const products = await Product.find({ category: { $exists: false } });
    console.log(`Found ${products.length} products without category`);

    // Update each product with a category based on name or description
    for (const product of products) {
      let category = 'women'; // Default category
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      
      // Determine category
      if (name.includes('men') || name.includes('male') || name.includes('groom')) {
        category = 'men';
      } else if (name.includes('women') || name.includes('female') || name.includes('bride') || name.includes('dress')) {
        category = 'women';
      } else if (name.includes('kid') || name.includes('child') || name.includes('baby')) {
        category = 'kids';
      } else {
        category = 'women'; // Default to women for dresses
      }
      
      product.category = category;
      await product.save();
      console.log(`Updated: ${product.name} -> ${category}`);
    }

    console.log('All products updated with categories!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addCategoriesToProducts();