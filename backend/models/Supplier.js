const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gstin: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  totalPurchases: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
