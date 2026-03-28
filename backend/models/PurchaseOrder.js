const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  receivedQuantity: { type: Number, default: 0 },
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [poItemSchema],
  status: { type: String, enum: ['pending', 'partial', 'received', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  expectedDate: { type: Date },
  receivedDate: { type: Date },
  totalAmount: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseOrderSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalCost, 0);
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
