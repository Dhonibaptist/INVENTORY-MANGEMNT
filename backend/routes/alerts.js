const express = require('express');
const router = express.Router();
const { getExpiryAlerts, getLowStockAlerts, getAllAlerts } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', getAllAlerts);
router.get('/expiry', getExpiryAlerts);
router.get('/low-stock', getLowStockAlerts);
module.exports = router;
