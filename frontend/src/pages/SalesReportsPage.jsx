import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { salesAPI, billingAPI } from '../services/api';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, titleColor: '#f9fafb', bodyColor: '#9ca3af' } },
  scales: { x: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 10 } } }, y: { grid: { color: '#1f2937' }, ticks: { color: '#6b7280', font: { size: 10 } } } },
};

export default function SalesReportsPage() {
  const [period, setPeriod] = useState('week');
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billPage, setBillPage] = useState(1);
  const [billTotal, setBillTotal] = useState(0);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sumRes, dailyRes, topRes, billRes] = await Promise.all([
          salesAPI.getSummary({ period }),
          salesAPI.getDaily({ days: period === 'week' ? 7 : period === 'month' ? 30 : 14 }),
          salesAPI.getTopProducts({ limit: 8 }),
          billingAPI.getAll({ page: billPage, limit: 10 }),
        ]);
        setSummary(sumRes.data.summary);
        setDailyData(dailyRes.data.data);
        setTopProducts(topRes.data.products);
        setBills(billRes.data.bills);
        setBillTotal(billRes.data.total);
      } catch { toast.error('Failed to load sales data'); }
      finally { setLoading(false); }
    };
    load();
  }, [period, billPage]);

  const lineData = {
    labels: dailyData.map(d => d.date),
    datasets: [{
      data: dailyData.map(d => d.revenue),
      borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.08)',
      tension: 0.4, fill: true, pointBackgroundColor: '#0ea5e9', pointRadius: 4,
    }],
  };

  const payBreakdown = summary?.paymentBreakdown || {};
  const doughnutData = {
    labels: Object.keys(payBreakdown).map(k => k.toUpperCase()),
    datasets: [{ data: Object.values(payBreakdown), backgroundColor: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'], borderWidth: 0, hoverOffset: 4 }],
  };

  const topBarData = {
    labels: topProducts.map(p => p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name),
    datasets: [{ data: topProducts.map(p => p.revenue), backgroundColor: 'rgba(139,92,246,0.75)', borderRadius: 6, borderSkipped: false }],
  };

  const downloadPDF = async (billId) => {
    setDownloading(billId);
    try {
      const { billingAPI: bapi } = await import('../services/api');
      const res = await billingAPI.getPDF(billId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${billId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF failed'); }
    finally { setDownloading(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
          <p className="text-gray-400 text-sm">Revenue, transactions, and product performance</p>
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

      {loading ? <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`₹${(summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon="💰" color="sky" />
            <StatCard title="Total Bills" value={summary?.totalBills || 0} icon="🧾" color="violet" />
            <StatCard title="Avg Bill Value" value={`₹${(summary?.avgBillValue || 0).toFixed(2)}`} icon="📊" color="green" />
            <StatCard title="Total Tax Collected" value={`₹${(summary?.totalTax || 0).toFixed(2)}`} icon="🏛" color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Revenue Trend</h3>
              <div style={{ height: 220 }}><Line data={lineData} options={chartOpts} /></div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Payment Breakdown</h3>
              {Object.keys(payBreakdown).length === 0 ? (
                <p className="text-gray-500 text-sm text-center pt-12">No data</p>
              ) : (
                <>
                  <div style={{ height: 160 }}><Doughnut data={doughnutData} options={{ ...chartOpts, scales: undefined, plugins: { ...chartOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } } } }} /></div>
                  <div className="mt-3 space-y-1.5">
                    {Object.entries(payBreakdown).map(([mode, amount]) => (
                      <div key={mode} className="flex justify-between text-xs">
                        <span className="text-gray-400 capitalize">{mode}</span>
                        <span className="text-gray-200 font-semibold">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Products by Revenue (30 days)</h3>
            {topProducts.length === 0 ? <p className="text-gray-500 text-sm">No data yet</p> : (
              <div style={{ height: 200 }}><Bar data={topBarData} options={chartOpts} /></div>
            )}
          </div>

          {/* Recent Bills */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="font-semibold text-gray-200 text-sm">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="text-left px-5 py-3 text-gray-400 font-semibold">Bill #</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold">Customer</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-semibold">Payment</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-semibold">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-500">No transactions yet</td></tr>
                  ) : bills.map(b => (
                    <tr key={b._id} className="table-row">
                      <td className="px-5 py-3 font-mono text-xs text-sky-400">{b.billNumber}</td>
                      <td className="px-4 py-3 text-gray-200">{b.customerName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(b.billDate).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className="badge bg-gray-800 text-gray-300 capitalize">{b.paymentMode}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-white">₹{b.grandTotal.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => downloadPDF(b._id)} disabled={downloading === b._id} className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium disabled:opacity-50">
                          {downloading === b._id ? '…' : '⬇ PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {billTotal > 10 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">Page {billPage} of {Math.ceil(billTotal / 10)}</p>
                <div className="flex gap-2">
                  <button disabled={billPage === 1} onClick={() => setBillPage(p => p-1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
                  <button disabled={billPage * 10 >= billTotal} onClick={() => setBillPage(p => p+1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
