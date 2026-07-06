import multer from 'multer';

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 25 },
  fileFilter: imageFilter,
});

export default memoryUpload;
