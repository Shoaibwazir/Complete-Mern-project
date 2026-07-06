export const CATEGORY_ALIASES = {
  women: ['women', 'womens', "women's", 'female', 'ladies'],
  men: ['men', 'mens', "men's", 'male'],
  shoes: ['shoes', 'footwear', 'shoe', 'sandals'],
  jewelry: ['jewelry', 'jewellery'],
  accessories: ['accessories', 'accessory'],
  traditional: ['traditional', 'ethnic', 'traditional accessories', 'ganda'],
  kids: ['kids', 'kid', 'children'],
  rental: ['rental'],
};

/** Canonical categories used by admin forms and API validation */
export const PRODUCT_CATEGORIES = [
  { value: 'women', label: "Women's Apparel", icon: '👗' },
  { value: 'men', label: "Men's Apparel", icon: '👔' },
  { value: 'shoes', label: 'Shoes', icon: '👠' },
  { value: 'jewelry', label: 'Jewellery', icon: '💎' },
  { value: 'traditional', label: 'Traditional Accessories', icon: '✨' },
  { value: 'accessories', label: 'Accessories', icon: '👜' },
];

export const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale Only' },
  { value: 'rental', label: 'For Rental Only' },
  { value: 'both', label: 'Sale + Rental (Buy or Hire)' },
];

export const CATEGORY_PAGES = {
  women: {
    slug: 'women',
    apiCategory: 'women',
    title: "Women's Apparel",
    heroTitle: "WOMEN'S PREMIUM COLLECTION",
    heroSubtitle: 'Authentic Afghani dresses and luxury womenswear',
    breadcrumb: 'Shop Women',
  },
  men: {
    slug: 'men',
    apiCategory: 'men',
    title: "Men's Apparel",
    heroTitle: "MEN'S PREMIUM COLLECTION",
    heroSubtitle: 'Ganda collections and refined menswear',
    breadcrumb: 'Shop Men',
  },
  shoes: {
    slug: 'shoes',
    apiCategory: 'shoes',
    title: 'Shoes & Sandals',
    heroTitle: 'FOOTWEAR COLLECTION',
    heroSubtitle: 'Step into luxury with our curated footwear',
    breadcrumb: 'Shoes & Sandals',
  },
  jewelry: {
    slug: 'jewelry',
    apiCategory: 'jewelry',
    title: 'Jewellery',
    heroTitle: 'TRADITIONAL JEWELLERY',
    heroSubtitle: 'Handcrafted pieces that tell a story',
    breadcrumb: 'Jewellery',
  },
  accessories: {
    slug: 'accessories',
    apiCategory: 'accessories',
    title: 'Traditional Accessories',
    heroTitle: 'LUXURY ACCESSORIES',
    heroSubtitle: 'Complete your look with premium accessories',
    breadcrumb: 'Accessories',
  },
  traditional: {
    slug: 'traditional',
    apiCategory: 'traditional',
    title: 'Traditional Accessories',
    heroTitle: 'HERITAGE COLLECTION',
    heroSubtitle: 'Authentic cultural apparel and accessories',
    breadcrumb: 'Traditional',
  },
};

export const getCategoryConfig = (key) => CATEGORY_PAGES[key] || null;

export const isValidCategory = (value) =>
  PRODUCT_CATEGORIES.some((c) => c.value === value);
