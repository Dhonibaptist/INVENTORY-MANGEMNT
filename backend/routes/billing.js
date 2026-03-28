const express = require('express');
const router = express.Router();
const { getBills, getBill, createBill, generateInvoicePDF } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getBills).post(createBill);
router.route('/:id').get(getBill);
router.get('/:id/pdf', generateInvoicePDF);
module.exports = router;
