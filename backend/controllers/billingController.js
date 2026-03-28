const Bill = require('../models/Bill');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');

const generateBillNumber = () => `BILL-${Date.now()}`;

exports.getBills = async (req, res) => {
  try {
    const { date, paymentMode, page = 1, limit = 20 } = req.query;
    const query = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.billDate = { $gte: start, $lt: end };
    }
    if (paymentMode) query.paymentMode = paymentMode;

    const bills = await Bill.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bill.countDocuments(query);
    res.json({ success: true, bills, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items.product').populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { customerName, customerPhone, items, paymentMode, amountPaid, notes, totalDiscount } = req.body;

    let subtotal = 0;
    let totalTax = 0;
    const billItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const taxAmount = (product.sellingPrice * item.quantity * (product.taxRate / 100));
      const itemTotal = (product.sellingPrice * item.quantity) + taxAmount - (item.discount || 0);

      subtotal += product.sellingPrice * item.quantity;
      totalTax += taxAmount;

      billItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        taxRate: product.taxRate,
        taxAmount,
        discount: item.discount || 0,
        total: itemTotal,
      });

      // Deduct stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stockQuantity: -item.quantity },
        lastSoldDate: new Date(),
      });
    }

    const grandTotal = subtotal + totalTax - (totalDiscount || 0);

    const bill = await Bill.create({
      billNumber: generateBillNumber(),
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      items: billItems,
      subtotal,
      totalTax,
      totalDiscount: totalDiscount || 0,
      grandTotal,
      paymentMode: paymentMode || 'cash',
      amountPaid: amountPaid || grandTotal,
      changeAmount: Math.max(0, (amountPaid || grandTotal) - grandTotal),
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateInvoicePDF = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items.product').populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('SMART STORE MANAGER', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Tax Invoice', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Bill info
    doc.fontSize(10);
    doc.text(`Bill No: ${bill.billNumber}`, 50);
    doc.text(`Date: ${new Date(bill.billDate).toLocaleDateString('en-IN')}`, 50);
    doc.text(`Customer: ${bill.customerName}`, 50);
    if (bill.customerPhone) doc.text(`Phone: ${bill.customerPhone}`, 50);
    doc.moveDown();

    // Table header
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, doc.y, { width: 200 });
    doc.text('Qty', 255, doc.y - doc.currentLineHeight(), { width: 50 });
    doc.text('Price', 305, doc.y - doc.currentLineHeight(), { width: 80 });
    doc.text('Tax', 385, doc.y - doc.currentLineHeight(), { width: 60 });
    doc.text('Total', 445, doc.y - doc.currentLineHeight(), { width: 100, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    doc.font('Helvetica').fontSize(9);
    bill.items.forEach(item => {
      const y = doc.y;
      doc.text(item.productName, 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 255, y, { width: 50 });
      doc.text(`₹${item.unitPrice.toFixed(2)}`, 305, y, { width: 80 });
      doc.text(`₹${item.taxAmount.toFixed(2)}`, 385, y, { width: 60 });
      doc.text(`₹${item.total.toFixed(2)}`, 445, y, { width: 100, align: 'right' });
      doc.moveDown();
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    doc.font('Helvetica').fontSize(10);
    doc.text(`Subtotal: ₹${bill.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: ₹${bill.totalTax.toFixed(2)}`, { align: 'right' });
    if (bill.totalDiscount > 0) doc.text(`Discount: -₹${bill.totalDiscount.toFixed(2)}`, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Grand Total: ₹${bill.grandTotal.toFixed(2)}`, { align: 'right' });
    doc.font('Helvetica').fontSize(10);
    doc.text(`Payment: ${bill.paymentMode.toUpperCase()}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(9).text('Thank you for your purchase!', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
