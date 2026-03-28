const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Category.deleteMany({}), Supplier.deleteMany({}), Product.deleteMany({})]);
    console.log('Cleared existing data');

    // Users
    const users = await User.create([
      { name: 'Store Owner', email: 'owner@smartstore.com', password: 'password123', role: 'owner', phone: '+91 9876543210' },
      { name: 'Store Manager', email: 'manager@smartstore.com', password: 'password123', role: 'manager', phone: '+91 9876543211' },
      { name: 'Cashier Ram', email: 'cashier@smartstore.com', password: 'password123', role: 'cashier', phone: '+91 9876543212' },
    ]);
    console.log('Created users');

    // Categories
    const categories = await Category.create([
      { name: 'Groceries', color: '#10b981' },
      { name: 'Dairy', color: '#0ea5e9' },
      { name: 'Beverages', color: '#8b5cf6' },
      { name: 'Snacks', color: '#f59e0b' },
      { name: 'Personal Care', color: '#ec4899' },
      { name: 'Household', color: '#6366f1' },
    ]);
    console.log('Created categories');

    const [groc, dairy, bev, snacks, personal, house] = categories;

    // Suppliers
    const suppliers = await Supplier.create([
      { name: 'Reliance Wholesale', contactPerson: 'Ramesh Kumar', phone: '+91 9001234567', email: 'reliance@wholesale.com', gstin: '27AABCR1234A1Z5', totalPurchases: 45000 },
      { name: 'Metro Cash & Carry', contactPerson: 'Sunita Patel', phone: '+91 9001234568', email: 'metro@cc.com', gstin: '29AABCM5678B2Z6', totalPurchases: 32000 },
      { name: 'Raj Dairy Farms', contactPerson: 'Raj Singh', phone: '+91 9001234569', email: 'raj@dairy.com', totalPurchases: 18000 },
    ]);
    console.log('Created suppliers');

    const [rel, metro, rajDairy] = suppliers;

    // Products
    const today = new Date();
    const in3days = new Date(today); in3days.setDate(today.getDate() + 3);
    const in10days = new Date(today); in10days.setDate(today.getDate() + 10);
    const in30days = new Date(today); in30days.setDate(today.getDate() + 30);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const thirtyAgo = new Date(today); thirtyAgo.setDate(today.getDate() - 35);

    await Product.create([
      { name: 'Tata Salt 1kg', barcode: '8901234000001', category: groc._id, unit: 'pcs', purchasePrice: 18, sellingPrice: 22, mrp: 24, taxRate: 0, stockQuantity: 50, minStockLevel: 10, supplier: rel._id, batchNumber: 'B001' },
      { name: 'Aashirvaad Atta 5kg', barcode: '8901234000002', category: groc._id, unit: 'pcs', purchasePrice: 210, sellingPrice: 240, mrp: 260, taxRate: 0, stockQuantity: 8, minStockLevel: 10, supplier: rel._id },
      { name: 'Amul Milk 500ml', barcode: '8901234000003', category: dairy._id, unit: 'pcs', purchasePrice: 25, sellingPrice: 30, mrp: 32, taxRate: 5, stockQuantity: 24, minStockLevel: 20, expiryDate: in3days, supplier: rajDairy._id, batchNumber: 'D001' },
      { name: 'Amul Butter 100g', barcode: '8901234000004', category: dairy._id, unit: 'pcs', purchasePrice: 50, sellingPrice: 60, mrp: 65, taxRate: 5, stockQuantity: 15, minStockLevel: 5, expiryDate: in30days, supplier: rajDairy._id },
      { name: 'Coca-Cola 2L', barcode: '8901234000005', category: bev._id, unit: 'pcs', purchasePrice: 70, sellingPrice: 85, mrp: 90, taxRate: 18, stockQuantity: 30, minStockLevel: 10, supplier: metro._id },
      { name: 'Sprite 750ml', barcode: '8901234000006', category: bev._id, unit: 'pcs', purchasePrice: 35, sellingPrice: 42, mrp: 45, taxRate: 18, stockQuantity: 5, minStockLevel: 10, supplier: metro._id },
      { name: 'Lays Classic Salted', barcode: '8901234000007', category: snacks._id, unit: 'pcs', purchasePrice: 15, sellingPrice: 20, mrp: 20, taxRate: 12, stockQuantity: 60, minStockLevel: 15, expiryDate: in10days, supplier: metro._id },
      { name: 'Parle-G Biscuits', barcode: '8901234000008', category: snacks._id, unit: 'pcs', purchasePrice: 8, sellingPrice: 10, mrp: 10, taxRate: 12, stockQuantity: 100, minStockLevel: 20, supplier: metro._id },
      { name: 'Expired Yoghurt 200g', barcode: '8901234000009', category: dairy._id, unit: 'pcs', purchasePrice: 20, sellingPrice: 25, taxRate: 5, stockQuantity: 8, minStockLevel: 5, expiryDate: yesterday, supplier: rajDairy._id },
      { name: 'Colgate Toothpaste 200g', barcode: '8901234000010', category: personal._id, unit: 'pcs', purchasePrice: 85, sellingPrice: 100, mrp: 110, taxRate: 18, stockQuantity: 20, minStockLevel: 5, lastSoldDate: thirtyAgo, supplier: metro._id },
      { name: 'Vim Dishwash Bar', barcode: '8901234000011', category: house._id, unit: 'pcs', purchasePrice: 25, sellingPrice: 30, mrp: 32, taxRate: 18, stockQuantity: 3, minStockLevel: 8, supplier: rel._id },
      { name: 'Surf Excel 1kg', barcode: '8901234000012', category: house._id, unit: 'pcs', purchasePrice: 140, sellingPrice: 170, mrp: 185, taxRate: 18, stockQuantity: 18, minStockLevel: 5, supplier: rel._id },
    ]);
    console.log('Created products');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo Credentials:');
    console.log('  Owner:   owner@smartstore.com / password123');
    console.log('  Manager: manager@smartstore.com / password123');
    console.log('  Cashier: cashier@smartstore.com / password123\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
