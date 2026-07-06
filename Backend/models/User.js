import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: [true, 'Name is required'], trim: true },
  email:      { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  password:   { type: String, required: [true, 'Password is required'], select: false },
  isAdmin:    { type: Boolean, default: false },
  phone:      { type: String, default: '' },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country:    { type: String, default: 'United Kingdom' },
}, { timestamps: true });

// Hash password once before save (never hash manually in routes)
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.ensureDefaultAdmin = async function () {
  const adminEmail = 'qasrelibasltd@gmail.com';
  const defaultPassword = 'Admin@123';

  try {
    let admin = await this.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      admin = await this.create({
        name: 'Qasr-e-Libas Admin',
        email: adminEmail,
        password: defaultPassword,
        isAdmin: true,
        country: 'United Kingdom',
      });
      console.log('✅ Default admin created');
      console.log('📧 Email   :', admin.email);
      console.log('🔑 Password:', defaultPassword);
      return;
    }

    let needsSave = false;

    if (!admin.isAdmin) {
      admin.isAdmin = true;
      needsSave = true;
    }

    const passwordValid = await admin.matchPassword(defaultPassword);
    if (!passwordValid) {
      admin.password = defaultPassword;
      needsSave = true;
      console.log('🔧 Admin password corrected (was double-hashed or outdated)');
    }

    if (needsSave) {
      await admin.save();
      console.log('✅ Admin account updated in database');
    }

    const verify = await this.findOne({ email: adminEmail }).select('+password');
    const verified = await verify.matchPassword(defaultPassword);
    console.log('👤 Admin ready:', verify.email, '| isAdmin:', verify.isAdmin, '| password OK:', verified);

    if (!verified) {
      console.error('❌ CRITICAL: Admin password still invalid after fix attempt');
    }
  } catch (err) {
    console.error('❌ Admin seed error:', err.message, err.stack);
  }
};

const User = mongoose.model('User', UserSchema);

export default User;
