import Product from '../models/Product.js';
import { uploadManyBuffersToCloudinary } from '../services/cloudinaryService.js';

const parseJSONField = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const addProductWithCloudinary = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      stock,
      listingType = 'sale',
      sku,
    } = req.body;

    if (!name?.trim() || !description?.trim() || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and description are required',
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    const cloudinaryResults = await uploadManyBuffersToCloudinary(req.files);

    const images = cloudinaryResults.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isMain: index === 0,
    }));

    const rentalConfig = parseJSONField(req.body.rental, {});
    const parsedListingType = listingType || 'sale';

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      category: category || 'traditional',
      stock: Number(stock) || 0,
      sku: sku || undefined,
      listingType: parsedListingType,
      isRental: parsedListingType === 'rental' || parsedListingType === 'both',
      rental: {
        available: rentalConfig.available ?? parsedListingType !== 'sale',
        pricePerDay: Number(rentalConfig.pricePerDay) || 0,
        deposit: Number(rentalConfig.deposit) || 0,
      },
      sizes: parseJSONField(req.body.sizes, []),
      colors: parseJSONField(req.body.colors, []),
      images,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created with Cloudinary images',
      product,
    });
  } catch (error) {
    console.error('Cloudinary product add error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};
