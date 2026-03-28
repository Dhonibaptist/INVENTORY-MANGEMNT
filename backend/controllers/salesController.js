const Bill = require('../models/Bill');
const Product = require('../models/Product');

exports.getSalesSummary = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (period === 'today') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const bills = await Bill.find({ billDate: { $gte: startDate }, paymentStatus: 'paid' });

    const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);
    const totalBills = bills.length;
    const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;
    const totalTax = bills.reduce((s, b) => s + b.totalTax, 0);

    // Payment breakdown
    const paymentBreakdown = bills.reduce((acc, b) => {
      acc[b.paymentMode] = (acc[b.paymentMode] || 0) + b.grandTotal;
      return acc;
    }, {});

    res.json({ success: true, summary: { totalRevenue, totalBills, avgBillValue, totalTax, paymentBreakdown } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDailySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const results = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const bills = await Bill.find({ billDate: { $gte: start, $lte: end }, paymentStatus: 'paid' });
      const revenue = bills.reduce((s, b) => s + b.grandTotal, 0);
      results.push({
        date: start.toISOString().split('T')[0],
        revenue,
        bills: bills.length,
      });
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() - 30);

    const bills = await Bill.find({ billDate: { $gte: thirtyDays } });
    const productSales = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const key = item.productName;
        if (!productSales[key]) productSales[key] = { name: key, quantity: 0, revenue: 0 };
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.total;
      });
    });

    const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
    res.json({ success: true, products: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfitLoss = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const bills = await Bill.find({ billDate: { $gte: startDate } }).populate('items.product', 'purchasePrice');

    let totalRevenue = 0;
    let totalCOGS = 0;

    bills.forEach(bill => {
      totalRevenue += bill.grandTotal;
      bill.items.forEach(item => {
        const pp = item.product?.purchasePrice || 0;
        totalCOGS += pp * item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: { totalRevenue, totalCOGS, grossProfit, grossMargin, period },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDeadStock = async (req, res) => {
  try {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() - 30);

    const deadStock = await Product.find({
      isActive: true,
      stockQuantity: { $gt: 0 },
      $or: [{ lastSoldDate: { $lt: thirtyDays } }, { lastSoldDate: null }],
    }).populate('category', 'name');

    res.json({ success: true, products: deadStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
