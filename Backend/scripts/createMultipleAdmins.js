import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './../models/User';

dotenv.config();

const admins = [
  {
    name: 'Super Admin',
    email: 'admin@fancyimpress.com',
    password: 'Admin@123',
    isAdmin: true,
    phone: '+44 7838 594463'
  },
  {
    name: 'Store Manager',
    email: 'manager@fancyimpress.com',
    password: 'Manager@123',
    isAdmin: true,
    phone: '+44 7979389080'
  },
  {
    name: 'Inventory Manager',
    email: 'inventory@fancyimpress.com',
    password: 'Inventory@123',
    isAdmin: true,
    phone: '+44 7979389080'
  }
];

const createAdmins = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    let created = 0;
    let skipped = 0;

    for (const adminData of admins) {
      // Check if admin exists
      const adminExists = await User.findOne({ email: adminData.email });
      
      if (adminExists) {
        console.log(`⚠️ Admin already exists: ${adminData.email}`);
        skipped++;
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Create admin
      await User.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        isAdmin: adminData.isAdmin,
        phone: adminData.phone,
        address: {
          street: '123 Luxury Street',
          city: 'London',
          state: 'Greater London',
          zipCode: 'SW1A 1AA',
          country: 'United Kingdom'
        }
      });
      
      console.log(`✅ Created: ${adminData.email} (${adminData.name})`);
      created++;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary: ${created} created, ${skipped} skipped`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (created > 0) {
      console.log('\n📋 Admin Credentials:');
      for (const admin of admins) {
        console.log(`\n📧 ${admin.email}`);
        console.log(`🔑 Password: ${admin.password}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmins();