const express = require('express');
const BinCard = require('../models/BinCard');
const Brand = require('../models/Brand');

const router = express.Router();

// Home
router.get('/', (req, res) => {
  res.status(200).send('This is the Bin Card route');
});

// Get all bin cards
router.get('/all', async (req, res) => {
  try {
    const binCards = await BinCard.find().populate("store brand");
    if (binCards.length > 0)
      res.status(200).json(binCards);
    else
      res.status(404).json({ message: "No bin card found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get unique brands by store from BinCard
router.get('/brandsByStore/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const brands = await BinCard.find({ store: storeId }).populate('brand');
    const uniqueBrands = Array.from(
      new Map(brands.map(b => [b.brand._id.toString(), b.brand])).values()
    );
    res.status(200).json(uniqueBrands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get BinCards by store and brand
router.get('/byStoreAndBrand', async (req, res) => {
  try {
    const { storeId, brandId } = req.query;

    if (!storeId || !brandId) {
      return res.status(400).json({ message: "Missing storeId or brandId" });
    }

    const records = await BinCard.find({
      store: storeId,
      brand: brandId
    }).populate("store");

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
