const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bankAccountNo: { type: String, required: true },
  bankName: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String },
  country: { type: String },
  zipCode: { type: String },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Vendor', vendorSchema);