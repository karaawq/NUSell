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



// NEW LISTINGS.JS

const express         = require('express');
const router          = express.Router();
const Listing         = require('./Listing');
const ReputationAward = require('./ReputationAward');
const User            = require('./user');
const auth            = require('../middleware/auth');

const SELLER_FIELDS = 'username telegram points';

// GET /api/listings — browse with optional filters, boosted by seller reputation
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, condition, location, minPrice, maxPrice, isFree } = req.query;
    const filter = { isActive: true };

    if (isFree !== undefined) filter.isFree = isFree === 'true';
    if (search)    filter.title     = { $regex: search, $options: 'i' };
    if (category)  filter.category  = { $in: category.split(',') };
    if (condition) filter.condition = { $in: condition.split(',') };
    if (location)  filter.location  = location;
    if (!filter.isFree && (minPrice || maxPrice)) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate('seller', SELLER_FIELDS)
      .sort({ createdAt: -1 });

    // boost listings by seller reputation — higher points float to top
    listings.sort((a, b) => {
      const aPts = a.seller?.points || 0;
      const bPts = b.seller?.points || 0;
      if (bPts !== aPts) return bPts - aPts;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/listings/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.userId, isActive: true })
      .populate('seller', SELLER_FIELDS)
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/listings
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, isFree, condition, category, location, imageUrl } = req.body;
    if (!title || !description || (!isFree && price == null) || !condition || !category || !location)
      return res.status(400).json({ message: 'Missing required fields' });

    const listing = await Listing.create({
      seller: req.user.id,
      title, description,
      price: isFree ? 0 : price,
      isFree: !!isFree,
      condition, category, location,
      imageUrl: imageUrl || '',
    });
    await listing.populate('seller', SELLER_FIELDS);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/listings/:id — include whether current user has reviewed + their star rating
router.get('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', SELLER_FIELDS);
    if (!listing || !listing.isActive)
      return res.status(404).json({ message: 'Listing not found' });

    const award = await ReputationAward.findOne({ from: req.user.id, listing: listing._id });
    res.json({
      ...listing.toObject(),
      userHasAwarded: !!award,
      userAwardStars: award?.stars || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/listings/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const { title, description, price, isFree, condition, category, location, imageUrl } = req.body;
    Object.assign(listing, { title, description, price: isFree ? 0 : price, isFree: !!isFree, condition, category, location, imageUrl });
    await listing.save();
    await listing.populate('seller', SELLER_FIELDS);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });
    listing.isActive = false;
    await listing.save();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/listings/:id/award — buyer rates seller after transaction
router.post('/:id/award', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() === req.user.id)
      return res.status(400).json({ message: 'Cannot review your own listing' });

    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5)
      return res.status(400).json({ message: 'Stars must be between 1 and 5' });

    const sellerPoints = stars * 10;
    const buyerPoints  = 10;

    await ReputationAward.create({
      from: req.user.id, to: listing.seller, listing: listing._id,
      stars, sellerPoints, buyerPoints,
    });

    // credit seller
    await User.findByIdAndUpdate(listing.seller, { $inc: { points: sellerPoints } });
    // credit buyer
    const updatedBuyer = await User.findByIdAndUpdate(
      req.user.id, { $inc: { points: buyerPoints } }, { new: true }
    ).select('-password');

    res.json({ message: 'Review submitted', sellerPoints, buyerPoints, buyer: updatedBuyer });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'You have already reviewed this listing' });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;