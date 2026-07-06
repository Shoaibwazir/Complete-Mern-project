import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './../models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    // Update or create admin
    const result = await User.findOneAndUpdate(
      { email: 'admin@fancyimpress.com' },
      {
        name: 'Super Admin',
        email: 'admin@fancyimpress.com',
        password: hashedPassword,
        isAdmin: true
      },
      { upsert: true, new: true }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin user ready!');
    console.log('📧 Email: admin@fancyimpress.com');
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();