const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const now = new Date();
    const sevenDays = new Date(); sevenDays.setDate(now.getDate() + 7);

    const [todayBills, totalProducts, suppliers, lowStockCount, expiredCount, expiringSoonCount] = await Promise.all([
      Bill.find({ billDate: { $gte: today, $lte: todayEnd }, paymentStatus: 'paid' }),
      Product.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } }),
      Product.countDocuments({ isActive: true, expiryDate: { $lt: now } }),
      Product.countDocuments({ isActive: true, expiryDate: { $gte: now, $lte: sevenDays } }),
    ]);

    const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);

    const weeklySales = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const dayBills = await Bill.find({ billDate: { $gte: start, $lte: end }, paymentStatus: 'paid' });
      weeklySales.push({ date: start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }), revenue: dayBills.reduce((s,b) => s+b.grandTotal, 0), count: dayBills.length });
    }

    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() - 30);
    const recentBills = await Bill.find({ billDate: { $gte: thirtyDays } });
    const productMap = {};
    recentBills.forEach(bill => bill.items.forEach(item => {
      if (!productMap[item.productName]) productMap[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
      productMap[item.productName].qty += item.quantity;
      productMap[item.productName].revenue += item.total;
    }));
    const topProducts = Object.values(productMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

    res.json({ success: true, stats: { todayRevenue, todayBillCount: todayBills.length, totalProducts, suppliers, lowStockCount, expiredCount, expiringSoonCount, alertCount: lowStockCount + expiredCount + expiringSoonCount }, weeklySales, topProducts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
