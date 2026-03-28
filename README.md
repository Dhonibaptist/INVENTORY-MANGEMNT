# 🏪 Smart Store Manager

> A full-stack web application that replaces manual pen-and-paper store management for local retailers.

**Tech Stack:** React + Vite · TailwindCSS · Chart.js · Node.js · Express · MongoDB Atlas · JWT · node-cron · PDFKit

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Local Setup](#local-setup)
- [Deploy Backend on Render](#deploy-backend-on-render)
- [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
- [Connect MongoDB Atlas](#connect-mongodb-atlas)
- [Seed the Database](#seed-the-database)
- [API Reference](#api-reference)

---

## Project Overview

Smart Store Manager solves a critical problem faced by local retailers:

- **Inventory waste** from expired and overstocked products
- **Manual billing errors** from paper-based POS systems
- **Zero visibility** into profit/loss and sales trends
- **No automated alerts** for stock and expiry emergencies

This platform provides a unified dashboard for inventory, billing, suppliers, purchase orders, profit & loss, and automated alerts — all running in real time.

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Daily revenue, bill count, low stock / expiry alerts, weekly chart, top products |
| **Inventory** | Add / Edit / Delete products, barcode, expiry, stock levels, categories |
| **POS Billing** | Barcode scanner simulation, cart, tax & discount, PDF invoice, cash/UPI/card |
| **Suppliers** | Add / Edit / Delete suppliers, track total purchases |
| **Purchase Orders** | Create POs, receive goods, auto-update stock, partial delivery |
| **Sales Reports** | Revenue trend, payment breakdown chart, transaction history with PDF download |
| **Profit & Loss** | Revenue vs COGS, gross profit, gross margin %, dead stock detection |
| **Analytics** | 30-day trends, top products, stock-by-category donut, inventory health radar |
| **Alerts** | Expired / expiring soon / low stock with severity badges |
| **Users & Roles** | Owner / Manager / Cashier with route-level RBAC |
| **Cron Jobs** | Midnight expiry check · 9PM daily sales summary (node-cron) |

---

## Folder Structure

```
smart-store-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── supplierController.js
│   │   ├── purchaseOrderController.js
│   │   ├── billingController.js
│   │   ├── salesController.js
│   │   ├── alertController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── jobs/
│   │   └── cronJobs.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Supplier.js
│   │   ├── PurchaseOrder.js
│   │   ├── Bill.js
│   │   ├── Alert.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── suppliers.js
│   │   ├── purchaseOrders.js
│   │   ├── billing.js
│   │   ├── sales.js
│   │   ├── alerts.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── BillingPage.jsx
│   │   │   ├── SuppliersPage.jsx
│   │   │   ├── PurchaseOrdersPage.jsx
│   │   │   ├── SalesReportsPage.jsx
│   │   │   ├── ProfitLossPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── AnalyticsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)

### 1. Clone / Extract the project

```bash
unzip smart-store-manager.zip
cd smart-store-manager
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-store-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

You should see:
```
✅ Database seeded successfully!
Demo Credentials:
  Owner:   owner@smartstore.com / password123
  Manager: manager@smartstore.com / password123
  Cashier: cashier@smartstore.com / password123
```

### 4. Run the Backend

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend starts on `http://localhost:5000`

### 5. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Run the Frontend

```bash
npm run dev
```

Frontend starts on `http://localhost:5173`

---

## Connect MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Cluster** (M0 Free Tier is sufficient)
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) for development, or your specific IP for production
5. Under **Connect** → **Connect your application**, copy the connection string
6. Replace `<username>`, `<password>`, and set the database name to `smart-store-manager`

```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/smart-store-manager?retryWrites=true&w=majority
```

---

## Deploy Backend on Render

1. Push the `backend/` folder to a GitHub repository

2. Go to [https://render.com](https://render.com) → **New Web Service**

3. Connect your GitHub repository

4. Configure the service:
   - **Name:** `smart-store-backend`
   - **Root Directory:** `backend` (if monorepo) or leave blank
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

5. Under **Environment Variables**, add:
   ```
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_secret_key
   CLIENT_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

6. Click **Create Web Service** — Render will auto-deploy on every push

7. Note your backend URL: `https://smart-store-backend.onrender.com`

---

## Deploy Frontend on Vercel

1. Push the `frontend/` folder to a GitHub repository

2. Go to [https://vercel.com](https://vercel.com) → **New Project**

3. Import your GitHub repository

4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (if monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://smart-store-backend.onrender.com/api
   ```

6. Click **Deploy** — Vercel handles the rest

7. Your app will be live at `https://smart-store-manager.vercel.app`

---

## API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/change-password` | Private | Change password |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Private | List all (supports search, category, lowStock filters) |
| GET | `/api/products/:id` | Private | Get single product |
| GET | `/api/products/barcode/:barcode` | Private | Lookup by barcode |
| POST | `/api/products` | Owner/Manager | Create product |
| PUT | `/api/products/:id` | Owner/Manager | Update product |
| DELETE | `/api/products/:id` | Owner | Soft delete |

### Billing
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/billing` | Private | List bills (paginated) |
| POST | `/api/billing` | Private | Create bill + deduct stock |
| GET | `/api/billing/:id` | Private | Get bill details |
| GET | `/api/billing/:id/pdf` | Private | Download PDF invoice |

### Sales
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/sales/summary` | Private | Revenue, bills, avg value |
| GET | `/api/sales/daily` | Private | Daily revenue array |
| GET | `/api/sales/top-products` | Private | Top selling products |
| GET | `/api/sales/profit-loss` | Owner/Manager | P&L with COGS |
| GET | `/api/sales/dead-stock` | Owner/Manager | Products not sold in 30 days |

### Alerts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/alerts` | Private | All alerts with counts |
| GET | `/api/alerts/expiry` | Private | Expired + expiring soon |
| GET | `/api/alerts/low-stock` | Private | Below min stock level |

---

## Cron Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Expiry Check | Midnight (0 0 * * *) | Counts expired & expiring-soon products, logs report |
| Daily Summary | 9 PM (0 21 * * *) | Logs daily revenue, bill count, low stock & expiry counts |

Extend these jobs to send email/WhatsApp notifications by adding a mailer or Twilio integration.

---

## Roles & Permissions

| Route/Feature | Owner | Manager | Cashier |
|---------------|-------|---------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| POS Billing | ✅ | ✅ | ✅ |
| Alerts | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ❌ |
| Suppliers | ✅ | ✅ | ❌ |
| Purchase Orders | ✅ | ✅ | ❌ |
| Sales Reports | ✅ | ✅ | ❌ |
| Profit & Loss | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ❌ |
| Users & Roles | ✅ | ❌ | ❌ |
| Delete Products | ✅ | ❌ | ❌ |

---

## License

MIT — Build freely, deploy proudly. 🚀
