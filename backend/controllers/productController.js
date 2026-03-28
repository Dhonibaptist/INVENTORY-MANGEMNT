const Product = require('../models/Product');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, expiring, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { barcode: { $regex: search, $options: 'i' } },
    ];
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$stockQuantity', '$minStockLevel'] };

    const products = await Product.find(query)
      .populate('category', 'name color')
      .populate('supplier', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    if (expiring === 'true') {
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      const expiringProducts = await Product.find({
        isActive: true,
        expiryDate: { $lte: sevenDays, $gte: new Date() },
      }).populate('category', 'name');
      return res.json({ success: true, products: expiringProducts, total: expiringProducts.length });
    }

    res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category supplier');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Barcode already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/barcode/:barcode
exports.getByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode, isActive: true }).populate('category', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
