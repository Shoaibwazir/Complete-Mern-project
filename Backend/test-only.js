import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 Testing MongoDB connection...');
console.log('📝 MONGODB_URI:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connection successful!');
    console.log('📊 Database:', mongoose.connection.name);
    await mongoose.connection.close();
    console.log('👋 Test complete');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();