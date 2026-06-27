const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');
const SELLER_FIELDS = 'username telegram points';

// GET /api/listings
router.get('/', auth, async (req, res) => {
    try {
        //const filter = { isActive: true };
        const { search, category, condition, location, minPrice, maxPrice } = req.query;
        const filter = { isActive: true };
        if (search)    filter.title     = { $regex: search, $options: 'i' };
        if (category)  filter.category  = { $in: category.split(',') };
        if (condition) filter.condition = { $in: condition.split(',') };
        if (location)  filter.location  = location;
        if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const listings = await Listing.find(filter).populate('seller', SELLER_FIELDS).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/listings
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, condition, category, location, imageUrl } = req.body;
    if (!title || !description || price == null || !condition || !category || !location) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const listing = await Listing.create({
        seller: req.user.id,
        title, description, price, condition, category, location,
        imageUrl: imageUrl || '',
    });
    await listing.populate('seller', SELLER_FIELDS);
    res.status(201).json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/listings/:id - for indiv listing
router.get('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('seller', SELLER_FIELDS);
        if (!listing || !listing.isActive) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/listings/:id  — update (seller only)
router.put('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if (listing.seller.toString() !== req.user.id) { //so u cant change other ppls stuff
            return res.status(403).json({ message: 'Dun do that' });
        }

        const { title, description, price, condition, category, location, imageUrl } = req.body;
        Object.assign(listing, { title, description, price, condition, category, location, imageUrl });
        await listing.save();
        await listing.populate('seller', SELLER_FIELDS);
        res.json(listing);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/listings/:id  — soft delete (seller only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if (listing.seller.toString() !== req.user.id) { //so u cant delete other ppls stuff
            return res.status(403).json({ message: 'Dun do that!' });
        }

        listing.isActive = false;
        await listing.save();
        res.json({ message: 'Listing removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;






