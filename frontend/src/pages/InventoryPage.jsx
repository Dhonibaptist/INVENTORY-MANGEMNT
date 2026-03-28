import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, supplierAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', barcode: '', category: '', description: '', unit: 'pcs', purchasePrice: '', sellingPrice: '', mrp: '', taxRate: 0, stockQuantity: 0, minStockLevel: 10, expiryDate: '', batchNumber: '', supplier: '' };

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, category: filterCat, lowStock: filterLow, page, limit: 20 });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, filterCat, filterLow, page]);
  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories));
    supplierAPI.getAll().then(r => setSuppliers(r.data.suppliers));
  }, []);

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ ...p, category: p.category?._id || '', supplier: p.supplier?._id || '', expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        await productAPI.update(editProduct._id, form);
        toast.success('Product updated');
      } else {
        await productAPI.create(form);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 text-sm">{total} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center py-4">
        <input className="input max-w-xs" placeholder="Search by name or barcode…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input max-w-xs" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={filterLow} onChange={e => setFilterLow(e.target.checked)} className="accent-sky-500 w-4 h-4" />
          Low Stock Only
        </label>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-5 py-3.5 text-gray-400 font-semibold">Product</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Category</th>
                <th className="text-right px-4 py-3.5 text-gray-400 font-semibold">Buy</th>
                <th className="text-right px-4 py-3.5 text-gray-400 font-semibold">Sell</th>
                <th className="text-right px-4 py-3.5 text-gray-400 font-semibold">Stock</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Expiry</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-500">Loading…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-500">No products found</td></tr>
              ) : products.map(p => {
                const isLow = p.stockQuantity <= p.minStockLevel;
                const isExpired = p.expiryDate && new Date(p.expiryDate) < new Date();
                const isSoon = p.expiryDate && !isExpired && (new Date(p.expiryDate) - new Date()) < 7 * 86400000;
                return (
                  <tr key={p._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-100">{p.name}</p>
                      {p.barcode && <p className="text-xs text-gray-500 font-mono">{p.barcode}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.category ? <span className="badge bg-gray-800 text-gray-300">{p.category.name}</span> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-300">₹{p.purchasePrice}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-sky-400">₹{p.sellingPrice}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-gray-100'}`}>{p.stockQuantity}</span>
                      <span className="text-gray-500 text-xs ml-1">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {isLow && <span className="badge bg-amber-500/15 text-amber-400">Low Stock</span>}
                        {isExpired && <span className="badge bg-red-500/15 text-red-400">Expired</span>}
                        {isSoon && <span className="badge bg-orange-500/15 text-orange-400">Expiring</span>}
                        {!isLow && !isExpired && !isSoon && <span className="badge bg-emerald-500/15 text-emerald-400">OK</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p+1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. Tata Salt 1kg" />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input className="input font-mono" value={form.barcode} onChange={f('barcode')} placeholder="8901234567890" />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={f('unit')}>
                {['pcs','kg','g','L','mL','pack','box','dozen','pair'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={f('category')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplier} onChange={f('supplier')}>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Purchase Price (₹) *</label>
              <input className="input" type="number" step="0.01" value={form.purchasePrice} onChange={f('purchasePrice')} required />
            </div>
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input className="input" type="number" step="0.01" value={form.sellingPrice} onChange={f('sellingPrice')} required />
            </div>
            <div>
              <label className="label">MRP (₹)</label>
              <input className="input" type="number" step="0.01" value={form.mrp} onChange={f('mrp')} />
            </div>
            <div>
              <label className="label">Tax Rate (%)</label>
              <select className="input" value={form.taxRate} onChange={f('taxRate')}>
                {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input className="input" type="number" value={form.stockQuantity} onChange={f('stockQuantity')} />
            </div>
            <div>
              <label className="label">Min Stock Level</label>
              <input className="input" type="number" value={form.minStockLevel} onChange={f('minStockLevel')} />
            </div>
            <div>
              <label className="label">Expiry Date</label>
              <input className="input" type="date" value={form.expiryDate} onChange={f('expiryDate')} />
            </div>
            <div>
              <label className="label">Batch Number</label>
              <input className="input" value={form.batchNumber} onChange={f('batchNumber')} placeholder="BATCH001" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={f('description')} placeholder="Optional product description" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
