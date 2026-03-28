import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { salesAPI, productAPI, alertAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const baseOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, titleColor: '#f9fafb', bodyColor: '#9ca3af' } },
  scales: { x: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 10 } } }, y: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 10 } } } },
};
const noScaleOpts = { ...baseOpts, scales: undefined };

export default function AnalyticsPage() {
  const [daily30, setDaily30] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [plWeek, setPlWeek] = useState(null);
  const [plMonth, setPlMonth] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d30, top, plW, plM, al, prod] = await Promise.all([
          salesAPI.getDaily({ days: 30 }),
          salesAPI.getTopProducts({ limit: 10 }),
          salesAPI.getProfitLoss({ period: 'week' }),
          salesAPI.getProfitLoss({ period: 'month' }),
          alertAPI.getAllAlerts(),
          productAPI.getAll({ limit: 200 }),
        ]);
        setDaily30(d30.data.data);
        setTopProducts(top.data.products);
        setPlWeek(plW.data.data);
        setPlMonth(plM.data.data);
        setAlerts(al.data.alerts);
        // Stock distribution by category
        const catMap = {};
        prod.data.products.forEach(p => {
          const cat = p.category?.name || 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + p.stockQuantity;
        });
        setStockData(Object.entries(catMap).map(([name, val]) => ({ name, val })));
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const revenueLineData = {
    labels: daily30.map(d => d.date),
    datasets: [
      { label: 'Revenue', data: daily30.map(d => d.revenue), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.08)', tension: 0.4, fill: true, pointRadius: 3 },
    ],
  };

  const billsBarData = {
    labels: daily30.map(d => d.date),
    datasets: [{ data: daily30.map(d => d.count), backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 4, borderSkipped: false }],
  };

  const topBarData = {
    labels: topProducts.map(p => p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name),
    datasets: [
      { label: 'Revenue', data: topProducts.map(p => p.revenue), backgroundColor: 'rgba(14,165,233,0.75)', borderRadius: 5, borderSkipped: false },
      { label: 'Qty Sold', data: topProducts.map(p => p.qty), backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 5, borderSkipped: false },
    ],
  };

  const topBarOptsWithLegend = { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: true, position: 'top', labels: { color: '#9ca3af', font: { size: 11 }, padding: 16 } } } };

  const stockDoughnutData = {
    labels: stockData.map(s => s.name),
    datasets: [{ data: stockData.map(s => s.val), backgroundColor: ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16'], borderWidth: 0, hoverOffset: 6 }],
  };

  const alertCounts = alerts?.counts || {};
  const radarData = {
    labels: ['Expired Stock', 'Expiring Soon', 'Low Stock', 'Dead Stock'],
    datasets: [{
      data: [alertCounts.expired || 0, alertCounts.expiringSoon || 0, alertCounts.lowStock || 0, 0],
      backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444', pointBackgroundColor: '#ef4444', pointRadius: 4,
    }],
  };

  const plComparData = {
    labels: ['Revenue', 'COGS', 'Profit'],
    datasets: [
      { label: 'This Week', data: plWeek ? [plWeek.totalRevenue, plWeek.totalCOGS, plWeek.grossProfit] : [], backgroundColor: 'rgba(14,165,233,0.75)', borderRadius: 5, borderSkipped: false },
      { label: 'This Month', data: plMonth ? [plMonth.totalRevenue, plMonth.totalCOGS, plMonth.grossProfit] : [], backgroundColor: 'rgba(139,92,246,0.75)', borderRadius: 5, borderSkipped: false },
    ],
  };
  const plComparOpts = { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: true, position: 'top', labels: { color: '#9ca3af', font: { size: 11 }, padding: 16 } } } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">Deep dive into your store's performance data</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', val: `₹${(plMonth?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-sky-400' },
          { label: 'Monthly Profit', val: `₹${(plMonth?.grossProfit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-emerald-400' },
          { label: 'Gross Margin', val: `${plMonth?.grossMargin || 0}%`, color: 'text-violet-400' },
          { label: 'Total Alerts', val: alertCounts.total || 0, color: alertCounts.total > 0 ? 'text-amber-400' : 'text-gray-400' },
        ].map((k, i) => (
          <div key={i} className="card text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Revenue + Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">30-Day Revenue Trend</h3>
          <div style={{ height: 210 }}><Line data={revenueLineData} options={baseOpts} /></div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">30-Day Daily Transactions</h3>
          <div style={{ height: 210 }}><Bar data={billsBarData} options={baseOpts} /></div>
        </div>
      </div>

      {/* Row 2: Top products + Stock distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top 10 Products — Revenue vs Quantity</h3>
          <div style={{ height: 230 }}><Bar data={topBarData} options={topBarOptsWithLegend} /></div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Stock by Category</h3>
          {stockData.length === 0 ? <p className="text-gray-500 text-sm text-center pt-10">No data</p> : (
            <>
              <div style={{ height: 160 }}>
                <Doughnut data={stockDoughnutData} options={{ ...noScaleOpts, plugins: { ...noScaleOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, padding: 8, boxWidth: 10 } } } }} />
              </div>
              <div className="mt-3 space-y-1">
                {stockData.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate">{s.name}</span>
                    <span className="text-gray-200 font-medium ml-2">{s.val} units</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: P&L comparison + Inventory health radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">P&L: Week vs Month Comparison</h3>
          <div style={{ height: 230 }}><Bar data={plComparData} options={plComparOpts} /></div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Inventory Health Radar</h3>
          <div style={{ height: 230 }}>
            <Radar data={radarData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, titleColor: '#f9fafb', bodyColor: '#9ca3af' } },
              scales: { r: { angleLines: { color: '#1f2937' }, grid: { color: '#1f2937' }, pointLabels: { color: '#9ca3af', font: { size: 11 } }, ticks: { color: '#6b7280', backdropColor: 'transparent', font: { size: 9 } } } },
            }} />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Lower values = healthier inventory. All zeros means no alerts. ✅</p>
        </div>
      </div>
    </div>
  );
}
