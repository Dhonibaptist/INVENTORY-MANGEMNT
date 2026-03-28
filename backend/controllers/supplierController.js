const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).populate('products', 'name sellingPrice');
    res.json({ success: true, suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('products');
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    const orders = await PurchaseOrder.find({ supplier: req.params.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, supplier, recentOrders: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
