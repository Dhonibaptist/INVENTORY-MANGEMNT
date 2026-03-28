const mongoose = require('mongoose');

const expiryAlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  expiryDate: { type: Date, required: true },
  daysRemaining: { type: Number },
  severity: { type: String, enum: ['warning', 'critical', 'expired'], default: 'warning' },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
}, { timestamps: true });

const reorderAlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  currentStock: { type: Number, required: true },
  minStockLevel: { type: Number, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
}, { timestamps: true });

const ExpiryAlert = mongoose.model('ExpiryAlert', expiryAlertSchema);
const ReorderAlert = mongoose.model('ReorderAlert', reorderAlertSchema);

module.exports = { ExpiryAlert, ReorderAlert };
