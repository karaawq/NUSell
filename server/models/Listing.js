const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    price:       { type: Number, default: 0, min: 0 },
    isFree:      { type: Boolean, default: false }, 
    condition:   { type: String, enum: ['new', 'like-new', 'good', 'fair'], required: true },
    category:    { type: String, required: true },
    location:    { type: String, required: true },
    imageUrl:    { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);