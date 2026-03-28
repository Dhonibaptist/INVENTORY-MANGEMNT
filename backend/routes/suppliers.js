const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getSuppliers).post(authorize('owner','manager'), createSupplier);
router.route('/:id').get(getSupplier).put(authorize('owner','manager'), updateSupplier).delete(authorize('owner'), deleteSupplier);
module.exports = router;
