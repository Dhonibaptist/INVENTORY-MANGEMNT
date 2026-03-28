const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories: cats });
});
router.post('/', authorize('owner','manager'), async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/:id', authorize('owner','manager'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category: cat });
});
router.delete('/:id', authorize('owner'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
module.exports = router;
