require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await Listing.updateMany(
    { isFree: { $exists: false } },   // only listings missing the field
    { $set: { isFree: false } }
  );
  console.log('Backfilled listings:', result.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });