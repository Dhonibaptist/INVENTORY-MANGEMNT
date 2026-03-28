const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true, required: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  customerPhone: { type: String },
  items: [billItemSchema],
  subtotal: { type: Number, required: true },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'upi', 'card', 'credit'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
  amountPaid: { type: Number },
  changeAmount: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  billDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
