const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
