const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { name, bankAccountNo, bankName, address1, address2, city, country, zipCode } = req.body;
    if (!name || !bankAccountNo || !bankName || !address1 || !city || !country || !zipCode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const vendor = new Vendor({
      name,
      bankAccountNo,
      bankName,
      address1,
      address2,
      city,
      country,
      zipCode,
      createdBy: req.user.googleId
    });
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    console.error('Vendor Creation Error:', err);
    res.status(400).json({ message: 'Failed to create vendor', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7; // Exactly 7 vendors per page
    const skip = (page - 1) * limit;
    const vendors = await Vendor.find({ createdBy: req.user.googleId })
      .skip(skip)
      .limit(limit);
    const total = await Vendor.countDocuments({ createdBy: req.user.googleId });
    res.json({ vendors, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    console.error('Vendor Fetch Error:', err);
    res.status(500).json({ message: 'Failed to fetch vendors', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, createdBy: req.user.googleId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    console.error('Vendor Fetch Error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, bankAccountNo, bankName, address1, address2, city, country, zipCode } = req.body;
    if (!name || !bankAccountNo || !bankName || !address1 || !city || !country || !zipCode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.googleId },
      { name, bankAccountNo, bankName, address1, address2, city, country, zipCode },
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    console.error('Vendor Update Error:', err);
    res.status(500).json({ message: 'Failed to update vendor', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, createdBy: req.user.googleId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    console.error('Vendor Deletion Error:', err);
    res.status(500).json({ message: 'Failed to delete vendor', error: err.message });
  }
});

module.exports = router;