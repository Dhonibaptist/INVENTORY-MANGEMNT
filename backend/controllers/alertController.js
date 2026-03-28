const Product = require('../models/Product');
const { ExpiryAlert, ReorderAlert } = require('../models/Alert');

exports.getExpiryAlerts = async (req, res) => {
  try {
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);

    const expiredProducts = await Product.find({ isActive: true, expiryDate: { $lt: now } }).populate('category', 'name');
    const expiringSoon = await Product.find({ isActive: true, expiryDate: { $gte: now, $lte: sevenDays } }).populate('category', 'name');

    res.json({ success: true, expired: expiredProducts, expiringSoon, totalAlerts: expiredProducts.length + expiringSoon.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } }).populate('category supplier', 'name');
    res.json({ success: true, products, total: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAlerts = async (req, res) => {
  try {
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);

    const [expired, expiringSoon, lowStock] = await Promise.all([
      Product.find({ isActive: true, expiryDate: { $lt: now } }).select('name expiryDate stockQuantity'),
      Product.find({ isActive: true, expiryDate: { $gte: now, $lte: sevenDays } }).select('name expiryDate stockQuantity'),
      Product.find({ isActive: true, $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } }).select('name stockQuantity minStockLevel'),
    ]);

    res.json({
      success: true,
      alerts: {
        expired, expiringSoon, lowStock,
        counts: { expired: expired.length, expiringSoon: expiringSoon.length, lowStock: lowStock.length, total: expired.length + expiringSoon.length + lowStock.length },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
