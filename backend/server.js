const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startCronJobs } = require('./jobs/cronJobs');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});

module.exports = app;
