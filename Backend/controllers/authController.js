import User from '../models/User.js';
import { signToken } from '../utils/jwtHelper.js';

const buildAuthResponse = (user, token) => ({
  success: true,
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: Boolean(user.isAdmin),
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
  },
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Password hashed once by User pre-save hook — do NOT bcrypt here
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = signToken({ id: user._id, isAdmin: user.isAdmin || false });

    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    console.error('❌ Register Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email?.toLowerCase?.()?.trim());

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      console.log('❌ Login failed — user not found:', email.toLowerCase().trim());
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Login failed — wrong password for:', user.email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken({ id: user._id, isAdmin: user.isAdmin || false });

    console.log('✅ Login success:', user.email, '| isAdmin:', user.isAdmin);

    return res.json(buildAuthResponse(user, token));
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const logoutUser = async (req, res) => {
  // JWT is stateless — client clears token; server confirms logout
  return res.json({ success: true, message: 'Logged out successfully' });
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
    });
  } catch (error) {
    console.error('❌ Profile Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name?.trim() || user.name;
    user.email = req.body.email?.toLowerCase().trim() || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();

    return res.json({
      success: true,
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      isAdmin: Boolean(updated.isAdmin),
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
