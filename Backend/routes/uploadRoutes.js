import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Single image upload
router.post('/single', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multiple images upload
router.post('/multiple', protect, admin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;