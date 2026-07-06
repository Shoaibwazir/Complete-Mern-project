import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export const uploadBufferToCloudinary = (buffer, options = {}) => {
  const folder = options.folder || 'qasr-elibas/products';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};

export const uploadManyBuffersToCloudinary = async (files, folder = 'qasr-elibas/products') => {
  const uploads = files.map((file) =>
    uploadBufferToCloudinary(file.buffer, { folder }).then((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }))
  );
  return Promise.all(uploads);
};

export { cloudinary };
