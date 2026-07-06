import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const ADMIN_EMAIL = 'qasrelibasltd@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!user) {
    user = await User.create({
      name: 'Qasr-e-Libas Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
    });
    console.log('Created new admin user');
  } else {
    user.password = ADMIN_PASSWORD;
    user.isAdmin = true;
    await user.save();
    console.log('Reset admin password and isAdmin flag');
  }

  const verify = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
  const ok = await verify.matchPassword(ADMIN_PASSWORD);
  console.log('Verification:', ok ? 'PASS' : 'FAIL');
  console.log('Email:', verify.email, '| isAdmin:', verify.isAdmin);

  await mongoose.disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
