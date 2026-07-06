// Backend/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ Multer Upload Instance (for local uploads)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// ✅ Cloudinary Upload Functions
const uploadToCloudinary = (filePath, folder = 'qasr-elibas/products') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

const uploadMultipleToCloudinary = async (files, folder = 'qasr-elibas/products') => {
  const promises = files.map(file => uploadToCloudinary(file.path, folder));
  return Promise.all(promises);
};

// ✅ Exports
export { 
  cloudinary, 
  upload,                    // ✅ ADD THIS
  uploadToCloudinary, 
  uploadMultipleToCloudinary 
};