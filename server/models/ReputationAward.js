const mongoose = require('mongoose');

const reputationAwardSchema = new mongoose.Schema(
  {
    from:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing:      { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    stars:        { type: Number, required: true, min: 1, max: 5 },
    sellerPoints: { type: Number, required: true }, // stars × 10
    buyerPoints:  { type: Number, default: 10 },    // flat reward for reviewing
  },
  { timestamps: true }
);

// one review per buyer per listing
reputationAwardSchema.index({ from: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('ReputationAward', reputationAwardSchema);

