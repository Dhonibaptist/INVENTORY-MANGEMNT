const cron = require('node-cron');
const Product = require('../models/Product');
const Bill = require('../models/Bill');

const startCronJobs = () => {
  // Job 1: Midnight - Check expiry & stock
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[CRON] Midnight expiry/stock check...');
      const now = new Date();
      const sevenDays = new Date(); sevenDays.setDate(now.getDate() + 7);
      const expired = await Product.countDocuments({ isActive: true, expiryDate: { $lt: now } });
      const expiringSoon = await Product.countDocuments({ isActive: true, expiryDate: { $gte: now, $lte: sevenDays } });
      const lowStock = await Product.countDocuments({ isActive: true, $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } });
      console.log(`[CRON] Expired: ${expired}, Expiring Soon: ${expiringSoon}, Low Stock: ${lowStock}`);
    } catch (err) { console.error('[CRON] Midnight error:', err.message); }
  });

  // Job 2: 9PM - Daily summary
  cron.schedule('0 21 * * *', async () => {
    try {
      console.log('[CRON] 9PM daily summary...');
      const today = new Date(); today.setHours(0,0,0,0);
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
      const todayBills = await Bill.find({ billDate: { $gte: today, $lte: todayEnd }, paymentStatus: 'paid' });
      const revenue = todayBills.reduce((s,b) => s + b.grandTotal, 0);
      console.log(`[CRON] Daily Revenue: RS.${revenue}, Bills: ${todayBills.length}`);
    } catch (err) { console.error('[CRON] 9PM error:', err.message); }
  });

  console.log('[CRON] Jobs scheduled.');
};

module.exports = { startCronJobs };
