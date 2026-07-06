// Apply in your Express product controller + Mongoose schema (backend repo).

const CATEGORY_ALIASES = {
  women: ['women', 'womens', "women's", 'female', 'ladies'],
  men: ['men', 'mens', "men's", 'male'],
  shoes: ['shoes', 'footwear', 'shoe', 'sandals'],
  jewelry: ['jewelry', 'jewellery'],
  accessories: ['accessories', 'accessory'],
  traditional: ['traditional', 'ethnic', 'ganda'],
};

const ALLOWED_CATEGORIES = Object.keys(CATEGORY_ALIASES);

/*
Product schema extension (Mongoose):

listingType: { type: String, enum: ['sale', 'rental'], default: 'sale' },
rental: {
  available: { type: Boolean, default: false },
  pricePerDay: { type: Number, min: 0 },
  deposit: { type: Number, min: 0 },
  minDays: { type: Number, default: 1 },
},
*/

export const getProducts = async (req, res) => {
  try {
    const { category, listingType } = req.query;
    const filter = {};

    if (category) {
      const key = String(category).trim().toLowerCase();
      if (!ALLOWED_CATEGORIES.includes(key)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      const aliases = CATEGORY_ALIASES[key] || [key];
      filter.category = {
        $regex: `^(${aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
        $options: 'i',
      };
    }

    if (listingType) {
      const type = String(listingType).trim().toLowerCase();
      if (!['sale', 'rental'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid listing type' });
      }
      filter.listingType = type;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateProductPayload = (body) => {
  const category = String(body.category || '').trim().toLowerCase();
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
  }
  if (body.listingType === 'rental') {
    if (!body.rental?.pricePerDay || body.rental.pricePerDay <= 0) {
      throw new Error('Rental items require a valid pricePerDay');
    }
  }
  return { ...body, category, listingType: body.listingType || 'sale' };
};
