import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules mein __dirname set karne ke liye
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env file ko root folder (scripts se aik level bahar) se load karne ke liye
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dropIndex = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in your .env file!');
    process.exit(1);
  }

  try {
    // MongoDB se connect karein
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const collection = mongoose.connection.collection('products');

    // 1. Drop the slug_1 index
    try {
      await collection.dropIndex('slug_1');
      console.log('✅ Dropped slug_1 index');
    } catch (err) {
      console.log('ℹ️ slug_1 index not found or already dropped');
    }

    // 2. Drop the sku_1 index (just in case)
    try {
      await collection.dropIndex('sku_1');
      console.log('✅ Dropped sku_1 index');
    } catch (err) {
      console.log('ℹ️ sku_1 index not found');
    }

    // 3. Clear old data to avoid any conflicts
    await collection.deleteMany({});
    console.log('✅ Deleted all products (Clean Slate)');

    console.log('🚀 DB is now ready! You can now add products.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Function ko call karein
dropIndex();