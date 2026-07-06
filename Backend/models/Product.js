import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: function() {
      return `QLIB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['women', 'men', 'kids', 'jewelry', 'shoes', 'accessories', 'traditional']
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  sizes: [String],
  colors: [String],
  images: [{
    url: String,
    publicId: String,
    isMain: { type: Boolean, default: false }
  }],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  material: { type: String, default: '' },
  brand: { type: String, default: 'QASR-E-LIBAS LTD' },
  careInstructions: { type: String, default: '' },
  origin: { type: String, default: '' },
  style: { type: String, default: '' },
  sleeveLength: { type: String, default: '' },
  requiresMeasurements: { type: Boolean, default: false },
  measurementFields: {
    type: Object,
    default: {
      bust: true,
      waist: true,
      hips: true,
      shoulder: false,
      armLength: false,
      thigh: false,
      calf: false,
      height: true,
      weight: false,
      customNotes: true
    }
  },
  
  // ✅ RENTAL FIELDS (as requested)
  listingType: {
    type: String,
    enum: ['sale', 'rental', 'both'],
    default: 'sale'
  },
  isRental: {
    type: Boolean,
    default: false
  },
  rental: {
    available: {
      type: Boolean,
      default: false
    },
    pricePerDay: {
      type: Number,
      default: 0
    },
    deposit: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// ✅ Index for rental queries
productSchema.index({ listingType: 1, isActive: 1 });
productSchema.index({ 'rental.available': 1 });

// ✅ Virtual for checking if rental is available
productSchema.virtual('isRentalAvailable').get(function() {
  return this.listingType === 'rental' && this.rental.available === true;
});

// ✅ Method to calculate total rental cost
productSchema.methods.calculateRentalCost = function(days) {
  if (this.listingType !== 'rental' || !this.rental.available) {
    return null;
  }
  const rentalCost = this.rental.pricePerDay * days;
  const totalWithDeposit = rentalCost + this.rental.deposit;
  return {
    days,
    pricePerDay: this.rental.pricePerDay,
    deposit: this.rental.deposit,
    rentalCost,
    total: totalWithDeposit
  };
};

const Product = mongoose.model('Product', productSchema);
export default Product;