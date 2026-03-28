import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    alertAPI.getAllAlerts().then(r => { setAlerts(r.data.alerts); setLoading(false); })
      .catch(() => { toast.error('Failed to load alerts'); setLoading(false); });
  }, []);

  const counts = alerts?.counts || {};

  const ProductRow = ({ product, badge, badgeClass }) => {
    const daysLeft = product.expiryDate
      ? Math.ceil((new Date(product.expiryDate) - new Date()) / 86400000)
      : null;
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
        <div>
          <p className="font-medium text-gray-100 text-sm">{product.name}</p>
          <div className="flex items-center gap-3 mt-1">
            {product.expiryDate && (
              <p className="text-xs text-gray-500">Expiry: {new Date(product.expiryDate).toLocaleDateString('en-IN')}</p>
            )}
            {product.stockQuantity !== undefined && (
              <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
            )}
            {product.minStockLevel !== undefined && (
              <p className="text-xs text-gray-500">Min: {product.minStockLevel}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {daysLeft !== null && (
            <span className="text-xs font-mono text-gray-400">
              {daysLeft <= 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
            </span>
          )}
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
        <p className="text-gray-400 text-sm">Real-time inventory health monitoring</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-xl">❌</div>
            <div>
              <p className="text-2xl font-bold text-red-400">{counts.expired || 0}</p>
              <p className="text-sm text-gray-400">Expired Products</p>
            </div>
          </div>
        </div>
        <div className="card border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl">⏰</div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{counts.expiringSoon || 0}</p>
              <p className="text-sm text-gray-400">Expiring in 7 Days</p>
            </div>
          </div>
        </div>
        <div className="card border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-xl">⚠️</div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{counts.lowStock || 0}</p>
              <p className="text-sm text-gray-400">Low Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cron info */}
      <div className="card border border-sky-500/20 bg-sky-500/5 flex items-start gap-4">
        <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚙️</div>
        <div>
          <h3 className="font-semibold text-sky-400 text-sm mb-1">Automated Alert System</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Midnight Job:</strong> Scans all products for expiry dates — marks items expiring within 7 days as <span className="text-orange-400">Warning</span> and expired items as <span className="text-red-400">Critical</span>.<br />
            <strong className="text-gray-300">9 PM Job:</strong> Sends daily store summary including today's sales, low stock items, and expiry warnings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `All (${counts.total || 0})` },
          { key: 'expired', label: `Expired (${counts.expired || 0})` },
          { key: 'expiringSoon', label: `Expiring Soon (${counts.expiringSoon || 0})` },
          { key: 'lowStock', label: `Low Stock (${counts.lowStock || 0})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${tab === t.key ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {(tab === 'all' || tab === 'expired') && (alerts?.expired || []).map(p => (
            <ProductRow key={p._id} product={p} badge="EXPIRED" badgeClass="bg-red-500/15 text-red-400" />
          ))}
          {(tab === 'all' || tab === 'expiringSoon') && (alerts?.expiringSoon || []).map(p => (
            <ProductRow key={p._id} product={p} badge="EXPIRING SOON" badgeClass="bg-orange-500/15 text-orange-400" />
          ))}
          {(tab === 'all' || tab === 'lowStock') && (alerts?.lowStock || []).map(p => (
            <ProductRow key={p._id} product={p} badge="LOW STOCK" badgeClass="bg-amber-500/15 text-amber-400" />
          ))}
          {counts.total === 0 && (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-400 font-medium">All clear! No active alerts.</p>
              <p className="text-gray-600 text-sm mt-1">Your inventory is in good shape.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
