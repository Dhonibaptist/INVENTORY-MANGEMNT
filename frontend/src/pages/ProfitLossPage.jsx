import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { salesAPI } from '../services/api';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProfitLossPage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [deadStock, setDeadStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [plRes, dsRes] = await Promise.all([
          salesAPI.getProfitLoss({ period }),
          salesAPI.getDeadStock(),
        ]);
        setData(plRes.data.data);
        setDeadStock(dsRes.data.products || []);
      } catch { toast.error('Failed to load P&L data'); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  const barData = data ? {
    labels: ['Revenue', 'COGS', 'Gross Profit'],
    datasets: [{
      data: [data.totalRevenue, data.totalCOGS, data.grossProfit],
      backgroundColor: ['rgba(14,165,233,0.8)', 'rgba(239,68,68,0.8)', 'rgba(16,185,129,0.8)'],
      borderRadius: 8, borderSkipped: false,
    }],
  } : null;

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, titleColor: '#f9fafb', bodyColor: '#9ca3af', callbacks: { label: ctx => `₹${ctx.raw.toLocaleString('en-IN')}` } } },
    scales: { x: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } }, y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af', callback: v => `₹${v.toLocaleString('en-IN')}` } } },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profit & Loss</h1>
          <p className="text-gray-400 text-sm">Financial performance overview</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${period === p ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon="💰" color="sky" subtitle={`Last ${period}`} />
            <StatCard title="Cost of Goods" value={`₹${(data.totalCOGS || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon="📦" color="red" subtitle="Purchase costs" />
            <StatCard title="Gross Profit" value={`₹${(data.grossProfit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon="📈" color="green" subtitle="Revenue − COGS" />
            <StatCard title="Gross Margin" value={`${data.grossMargin || 0}%`} icon="%" color="violet" subtitle="Profitability ratio" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">P&L Breakdown</h3>
              <div style={{ height: 240 }}><Bar data={barData} options={chartOpts} /></div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Revenue', val: data.totalRevenue, color: 'text-sky-400' },
                  { label: 'Total COGS', val: data.totalCOGS, color: 'text-red-400', prefix: '−' },
                  { label: 'Gross Profit', val: data.grossProfit, color: 'text-emerald-400', bold: true },
                  { label: 'Gross Margin %', val: null, display: `${data.grossMargin}%`, color: 'text-violet-400', bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center py-2.5 ${i < 3 ? 'border-b border-gray-800' : ''} ${row.bold ? 'bg-gray-800/40 px-3 rounded-xl' : ''}`}>
                    <span className={`text-sm ${row.bold ? 'font-semibold text-gray-200' : 'text-gray-400'}`}>{row.label}</span>
                    <span className={`font-bold ${row.color}`}>
                      {row.prefix}{row.display || `₹${(row.val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20">
                <p className="text-xs text-gray-400 mb-1">Profitability Status</p>
                <p className={`text-lg font-bold ${data.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.grossProfit >= 0 ? '✅ Profitable' : '❌ Loss Making'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You earned {data.grossMargin}% margin on every rupee of revenue this {period}
                </p>
              </div>
            </div>
          </div>

          {/* Dead Stock */}
          {deadStock.length > 0 && (
            <div className="card border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🪦</span>
                <div>
                  <h3 className="font-semibold text-amber-400">Dead Stock ({deadStock.length} products)</h3>
                  <p className="text-xs text-gray-500">Products not sold in the last 30 days — consider running a clearance sale</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Product</th>
                      <th className="text-left py-2 pr-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-right py-2 pr-4 text-gray-400 font-semibold">Stock</th>
                      <th className="text-right py-2 text-gray-400 font-semibold">Value (at sell price)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deadStock.map(p => (
                      <tr key={p._id} className="border-b border-gray-800/50">
                        <td className="py-2.5 pr-4 text-gray-200">{p.name}</td>
                        <td className="py-2.5 pr-4 text-gray-400">{p.category?.name || '—'}</td>
                        <td className="py-2.5 pr-4 text-right text-amber-400 font-semibold">{p.stockQuantity} {p.unit}</td>
                        <td className="py-2.5 text-right text-gray-300 font-semibold">₹{(p.sellingPrice * p.stockQuantity).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
