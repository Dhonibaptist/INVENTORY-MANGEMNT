const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getByBarcode } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/barcode/:barcode', getByBarcode);
router.route('/').get(getProducts).post(authorize('owner','manager'), createProduct);
router.route('/:id').get(getProduct).put(authorize('owner','manager'), updateProduct).delete(authorize('owner'), deleteProduct);
module.exports = router;
