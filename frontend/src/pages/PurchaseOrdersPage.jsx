import { useState, useEffect } from 'react';
import { purchaseOrderAPI, supplierAPI, productAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-amber-500/15 text-amber-400',
  partial: 'bg-sky-500/15 text-sky-400',
  received: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ supplier: '', expectedDate: '', notes: '', items: [{ product: '', quantity: 1, purchasePrice: '' }] });
  const [receivedQtys, setReceivedQtys] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const [ordRes, supRes, prodRes] = await Promise.all([
        purchaseOrderAPI.getAll({ status: filterStatus }),
        supplierAPI.getAll(),
        productAPI.getAll({ limit: 200 }),
      ]);
      setOrders(ordRes.data.orders);
      setSuppliers(supRes.data.suppliers);
      setProducts(prodRes.data.products);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [filterStatus]);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product: '', quantity: 1, purchasePrice: '' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item) }));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await purchaseOrderAPI.create(form);
      toast.success('Purchase order created');
      setCreateModal(false);
      setForm({ supplier: '', expectedDate: '', notes: '', items: [{ product: '', quantity: 1, purchasePrice: '' }] });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const openReceive = (order) => {
    setSelectedOrder(order);
    const init = {};
    order.items.forEach(item => { init[item._id] = item.quantity - item.receivedQuantity; });
    setReceivedQtys(init);
    setReceiveModal(true);
  };

  const handleReceive = async () => {
    setSaving(true);
    try {
      const receivedItems = selectedOrder.items.map(item => ({ itemId: item._id, receivedQuantity: parseInt(receivedQtys[item._id] || 0) }));
      await purchaseOrderAPI.receive(selectedOrder._id, { receivedItems });
      toast.success('Order updated — stock added');
      setReceiveModal(false);
      fetch();
    } catch { toast.error('Error receiving order'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await purchaseOrderAPI.cancel(id); toast.success('Order cancelled'); fetch(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} orders</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary">+ New Purchase Order</button>
      </div>

      <div className="card py-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'partial', 'received', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filterStatus === s ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-5 py-3.5 text-gray-400 font-semibold">PO Number</th>
              <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Supplier</th>
              <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Date</th>
              <th className="text-right px-4 py-3.5 text-gray-400 font-semibold">Amount</th>
              <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Status</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No orders found</td></tr>
            ) : orders.map(o => (
              <tr key={o._id} className="table-row">
                <td className="px-5 py-3.5 font-mono text-xs text-sky-400">{o.poNumber}</td>
                <td className="px-4 py-3.5 font-medium text-gray-200">{o.supplier?.name}</td>
                <td className="px-4 py-3.5 text-gray-400">{new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3.5 text-right font-bold text-white">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5"><span className={`badge capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    {(o.status === 'pending' || o.status === 'partial') && (
                      <button onClick={() => openReceive(o)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Receive</button>
                    )}
                    {o.status === 'pending' && (
                      <button onClick={() => handleCancel(o._id)} className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Purchase Order" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Supplier *</label>
              <select className="input" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} required>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expected Delivery</label>
              <input className="input" type="date" value={form.expectedDate} onChange={e => setForm({...form, expectedDate: e.target.value})} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Order Items</label>
              <button type="button" onClick={addItem} className="text-xs text-sky-400 hover:text-sky-300 font-medium">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <label className="label text-xs">Product</label>}
                    <select className="input" value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} required>
                      <option value="">Select product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="label text-xs">Quantity</label>}
                    <input className="input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="label text-xs">Unit Price (₹)</label>}
                    <input className="input" type="number" step="0.01" value={item.purchasePrice} onChange={e => updateItem(i, 'purchasePrice', e.target.value)} required />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="w-9 h-[42px] flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">✕</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Creating…' : 'Create Purchase Order'}</button>
            <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Receive Modal */}
      <Modal isOpen={receiveModal} onClose={() => setReceiveModal(false)} title="Receive Goods" size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">PO: <span className="text-sky-400 font-mono">{selectedOrder.poNumber}</span> · {selectedOrder.supplier?.name}</p>
            <div className="space-y-3">
              {selectedOrder.items.map(item => (
                <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-100">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">Ordered: {item.quantity} · Received so far: {item.receivedQuantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Now Receiving:</label>
                    <input
                      className="input w-24"
                      type="number"
                      min="0"
                      max={item.quantity - item.receivedQuantity}
                      value={receivedQtys[item._id] || 0}
                      onChange={e => setReceivedQtys({...receivedQtys, [item._id]: e.target.value})}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleReceive} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : '✅ Confirm Receipt'}</button>
              <button onClick={() => setReceiveModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
