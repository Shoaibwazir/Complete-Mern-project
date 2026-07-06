// createAdmin.js
// Run: node createAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Same schema as User.js
const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:   { type: String, required: true },
  isAdmin:    { type: Boolean, default: false },
  phone:      { type: String, default: '' },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country:    { type: String, default: 'United Kingdom' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// ==============================
// ✅ ADMIN CREDENTIALS — YAHAN CHANGE KARO
// ==============================
const ADMIN = {
  name:     'Irfan',
  email:    'admin@qasrelibas.co.uk',
  password: 'Admin@123456',
  isAdmin:  true,
  country:  'United Kingdom',
};
// ==============================

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Already exists check
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.email);
      console.log('👤 isAdmin:', existing.isAdmin);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN.password, salt);

    const admin = await User.create({ ...ADMIN, password: hashed });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email   :', admin.email);
    console.log('🔑 Password:', ADMIN.password);
    console.log('👤 isAdmin :', admin.isAdmin);
    console.log('🆔 ID      :', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();