import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    unitLabel: {
      type: String,
      default: 'tablet'
    },

    safetyNote: {
      type: String,
      default: ''
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Product', productSchema);