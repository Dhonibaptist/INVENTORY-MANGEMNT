import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import BillingPage from './pages/BillingPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import SalesReportsPage from './pages/SalesReportsPage';
import ProfitLossPage from './pages/ProfitLossPage';
import AlertsPage from './pages/AlertsPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-950"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><InventoryPage /></Layout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Layout><BillingPage /></Layout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><SuppliersPage /></Layout></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><PurchaseOrdersPage /></Layout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><SalesReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/profit-loss" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><ProfitLossPage /></Layout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Layout><AlertsPage /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['owner']}><Layout><UsersPage /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={['owner','manager']}><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
