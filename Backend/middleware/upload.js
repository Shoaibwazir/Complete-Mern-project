import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { MAX_PRODUCT_IMAGES, MAX_IMAGE_FILE_SIZE } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpe?g|png|gif|webp|heic|heif|bmp|tiff?/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const hasValidExt = ext ? allowed.test(ext) : false;
  const hasValidMime =
    file.mimetype &&
    (file.mimetype.startsWith('image/') || allowed.test(file.mimetype));

  if (hasValidExt || hasValidMime) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed (${file.originalname})`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE,
    files: MAX_PRODUCT_IMAGES,
  },
  fileFilter: fileFilter,
});

export default upload;
