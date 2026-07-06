import { MAX_PRODUCT_IMAGES, MAX_IMAGE_FILE_SIZE } from '../config/uploadLimits';

const ALLOWED_EXT = /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff?)$/i;
const MAX_MB = MAX_IMAGE_FILE_SIZE / (1024 * 1024);

/** Check if a File object looks like an acceptable product image */
export function isProductImageFile(file) {
  if (!file || !file.size) return false;
  if (file.type?.startsWith('image/')) return true;
  if (ALLOWED_EXT.test(file.name)) return true;
  // iPhone/camera names picked via image dialog (sometimes empty MIME on Windows)
  if (/^IMG[-_]\d+/i.test(file.name)) return true;
  return false;
}

/**
 * Validate a batch of selected files.
 * Returns { validFiles, errors, addedCount, totalAfter }
 */
export function processImageFileSelection(files, currentCount = 0) {
  const list = Array.from(files || []);
  const errors = [];
  const validFiles = [];

  if (list.length === 0) {
    return { validFiles, errors, addedCount: 0, totalAfter: currentCount };
  }

  const remaining = MAX_PRODUCT_IMAGES - currentCount;
  if (remaining <= 0) {
    errors.push(`Maximum ${MAX_PRODUCT_IMAGES} images allowed per product.`);
    return { validFiles, errors, addedCount: 0, totalAfter: currentCount };
  }

  for (const file of list) {
    if (!isProductImageFile(file)) {
      errors.push(
        `"${file.name}" — unsupported format. Use JPG, PNG, WebP, or HEIC from your phone.`
      );
      continue;
    }
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      errors.push(`"${file.name}" — too large (${sizeMb}MB). Max ${MAX_MB}MB per image.`);
      continue;
    }
    validFiles.push(file);
  }

  let trimmed = validFiles;
  if (validFiles.length > remaining) {
    trimmed = validFiles.slice(0, remaining);
    errors.push(`Only ${remaining} more slot(s) available (max ${MAX_PRODUCT_IMAGES} total).`);
  }

  return {
    validFiles: trimmed,
    errors,
    addedCount: trimmed.length,
    totalAfter: currentCount + trimmed.length,
  };
}

export function createImagePreviews(files) {
  return files.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    isHeic: /\.heic$/i.test(file.name) || file.type === 'image/heic',
  }));
}

export function revokeImagePreviews(previews) {
  previews.forEach((preview) => {
    const url = typeof preview === 'string' ? preview : preview?.url;
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  });
}

export { MAX_PRODUCT_IMAGES, MAX_MB };
