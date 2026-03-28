import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, titleColor: '#f9fafb', bodyColor: '#9ca3af' } },
  scales: {
    x: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 11 } } },
    y: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 11 } } },
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = data?.stats || {};
  const weeklySales = data?.weeklySales || [];
  const topProducts = data?.topProducts || [];

  const lineData = {
    labels: weeklySales.map(d => d.date),
    datasets: [{
      label: 'Revenue',
      data: weeklySales.map(d => d.revenue),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 4,
    }],
  };

  const barData = {
    labels: weeklySales.map(d => d.date),
    datasets: [{
      label: 'Bills',
      data: weeklySales.map(d => d.count),
      backgroundColor: 'rgba(139,92,246,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const topBarData = {
    labels: topProducts.map(p => p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name),
    datasets: [{
      data: topProducts.map(p => p.revenue),
      backgroundColor: ['rgba(14,165,233,0.8)', 'rgba(139,92,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`₹${(stats.todayRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} subtitle="Paid bills only" icon="💰" color="sky" />
        <StatCard title="Today's Bills" value={stats.todayBillCount || 0} subtitle="Transactions today" icon="🧾" color="violet" />
        <StatCard title="Total Products" value={stats.totalProducts || 0} subtitle="Active in inventory" icon="📦" color="green" />
        <StatCard title="Active Suppliers" value={stats.suppliers || 0} subtitle="Registered vendors" icon="🏭" color="indigo" />
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`card border ${stats.lowStockCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-gray-800'} flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stats.lowStockCount > 0 ? 'bg-amber-500/20' : 'bg-gray-800'}`}>⚠️</div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{stats.lowStockCount || 0}</p>
            <p className="text-sm text-gray-400">Low Stock Alerts</p>
          </div>
        </div>
        <div className={`card border ${stats.expiringSoonCount > 0 ? 'border-orange-500/30 bg-orange-500/5' : 'border-gray-800'} flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stats.expiringSoonCount > 0 ? 'bg-orange-500/20' : 'bg-gray-800'}`}>⏰</div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{stats.expiringSoonCount || 0}</p>
            <p className="text-sm text-gray-400">Expiring in 7 Days</p>
          </div>
        </div>
        <div className={`card border ${stats.expiredCount > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-gray-800'} flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stats.expiredCount > 0 ? 'bg-red-500/20' : 'bg-gray-800'}`}>❌</div>
          <div>
            <p className="text-2xl font-bold text-red-400">{stats.expiredCount || 0}</p>
            <p className="text-sm text-gray-400">Expired Products</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Weekly Revenue Trend</h3>
          <div style={{ height: 200 }}>
            <Line data={lineData} options={chartDefaults} />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Bill Count</h3>
          <div style={{ height: 200 }}>
            <Bar data={barData} options={chartDefaults} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Products (30 days)</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales data yet.</p>
          ) : (
            <div style={{ height: 200 }}>
              <Bar data={topBarData} options={{ ...chartDefaults, indexAxis: 'y' }} />
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Bill', icon: '🧾', path: '/billing', color: 'sky' },
              { label: 'Add Product', icon: '📦', path: '/inventory', color: 'violet' },
              { label: 'New PO', icon: '📋', path: '/purchase-orders', color: 'green' },
              { label: 'View Alerts', icon: '🔔', path: '/alerts', color: 'amber' },
              { label: 'Sales Report', icon: '📊', path: '/sales', color: 'indigo' },
              { label: 'P&L Report', icon: '💰', path: '/profit-loss', color: 'red' },
            ].map((action, i) => {
              const colors = {
                sky: 'hover:border-sky-500/50 hover:bg-sky-500/5',
                violet: 'hover:border-violet-500/50 hover:bg-violet-500/5',
                green: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
                amber: 'hover:border-amber-500/50 hover:bg-amber-500/5',
                indigo: 'hover:border-indigo-500/50 hover:bg-indigo-500/5',
                red: 'hover:border-red-500/50 hover:bg-red-500/5',
              };
              return (
                <a key={i} href={action.path} className={`flex items-center gap-3 p-3 rounded-xl border border-gray-800 transition-all duration-200 group ${colors[action.color]}`}>
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
