const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

const generatePONumber = () => `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier } = req.query;
    const query = {};
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;

    const orders = await PurchaseOrder.find(query)
      .populate('supplier', 'name phone')
      .populate('items.product', 'name unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, expectedDate, notes } = req.body;
    const poItems = items.map(item => ({
      ...item,
      totalCost: item.quantity * item.purchasePrice,
    }));
    const order = await PurchaseOrder.create({
      poNumber: generatePONumber(),
      supplier,
      items: poItems,
      expectedDate,
      notes,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.receiveOrder = async (req, res) => {
  try {
    const { receivedItems } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    let allReceived = true;
    let anyReceived = false;

    for (const received of receivedItems) {
      const item = order.items.id(received.itemId);
      if (item) {
        item.receivedQuantity = received.receivedQuantity;
        if (item.receivedQuantity < item.quantity) allReceived = false;
        if (item.receivedQuantity > 0) anyReceived = true;

        // Update product stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: received.receivedQuantity },
          purchasePrice: item.purchasePrice,
        });
      }
    }

    order.status = allReceived ? 'received' : anyReceived ? 'partial' : 'pending';
    if (allReceived) order.receivedDate = new Date();

    // Update supplier total purchases
    await Supplier.findByIdAndUpdate(order.supplier, { $inc: { totalPurchases: order.totalAmount } });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
