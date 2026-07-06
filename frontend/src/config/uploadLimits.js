// src/config/uploadLimits.js

// ========================================
// UPLOAD LIMITS CONFIGURATION
// ========================================

// ✅ Maximum images per product
export const MAX_PRODUCT_IMAGES = 10;

// ✅ Maximum file size in MB - CHANGED FROM 5 TO 20
export const MAX_MB = 20; // 20MB per image

// ✅ Maximum file size in bytes
export const MAX_BYTES = MAX_MB * 1024 * 1024;

// ✅ Maximum total upload size (10 images × 20MB = 200MB)
export const MAX_TOTAL_MB = MAX_MB * MAX_PRODUCT_IMAGES;
export const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

// ✅ Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
];

// ✅ Allowed file extensions
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.heic', '.heif', '.avif'
];

// ✅ Validation messages
export const UPLOAD_MESSAGES = {
  MAX_FILES: `Maximum ${MAX_PRODUCT_IMAGES} images allowed`,
  MAX_SIZE: `Each image must be ${MAX_MB}MB or less`,
  INVALID_TYPE: 'Only image files are allowed (JPG, PNG, WebP, HEIC)',
  TOTAL_SIZE: `Total upload size cannot exceed ${MAX_TOTAL_MB}MB`,
};

// ✅ Aliases for backward compatibility
export const MAX_IMAGE_FILE_SIZE = MAX_BYTES;
export const MAX_IMAGE_COUNT = MAX_PRODUCT_IMAGES;
export const MAX_IMAGE_SIZE_MB = MAX_MB;

// ✅ Default export
export default {
  MAX_PRODUCT_IMAGES,
  MAX_MB,
  MAX_BYTES,
  MAX_TOTAL_MB,
  MAX_TOTAL_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_MESSAGES,
  MAX_IMAGE_FILE_SIZE: MAX_BYTES,
  MAX_IMAGE_COUNT: MAX_PRODUCT_IMAGES,
  MAX_IMAGE_SIZE_MB: MAX_MB,
};