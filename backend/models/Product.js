const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  barcode: { type: String, unique: true, sparse: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  unit: { type: String, default: 'pcs' },
  purchasePrice: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, required: true },
  mrp: { type: Number },
  taxRate: { type: Number, default: 0 }, // percentage
  stockQuantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  expiryDate: { type: Date },
  batchNumber: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  lastSoldDate: { type: Date },
}, { timestamps: true });

productSchema.virtual('profitMargin').get(function () {
  if (this.purchasePrice === 0) return 0;
  return (((this.sellingPrice - this.purchasePrice) / this.purchasePrice) * 100).toFixed(2);
});

productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.minStockLevel;
});

productSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date(this.expiryDate) < new Date();
});

productSchema.virtual('isExpiringSoon').get(function () {
  if (!this.expiryDate) return false;
  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() + 7);
  return new Date(this.expiryDate) <= sevenDays && new Date(this.expiryDate) >= new Date();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
