import { useState, useEffect } from 'react';
import { supplierAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const EMPTY = { name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', notes: '' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const r = await supplierAPI.getAll(); setSuppliers(r.data.suppliers); }
    catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await supplierAPI.update(editItem._id, form); toast.success('Supplier updated'); }
      else { await supplierAPI.create(form); toast.success('Supplier added'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this supplier?')) return;
    try { await supplierAPI.delete(id); toast.success('Supplier removed'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-gray-400 text-sm">{suppliers.length} registered vendors</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Supplier</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {suppliers.length === 0 ? (
            <div className="col-span-3 card text-center py-16 text-gray-500">
              <p className="text-3xl mb-3">🏭</p>
              <p>No suppliers yet. Add your first supplier.</p>
            </div>
          ) : suppliers.map(s => (
            <div key={s._id} className="card hover:border-gray-700 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-lg flex-shrink-0">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="text-xs text-sky-400 hover:text-sky-300 font-medium">Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="text-xs text-red-400 hover:text-red-300 font-medium">Del</button>
                </div>
              </div>
              <h3 className="font-semibold text-white text-base mb-1">{s.name}</h3>
              {s.contactPerson && <p className="text-sm text-gray-400 mb-0.5">👤 {s.contactPerson}</p>}
              {s.phone && <p className="text-sm text-gray-400 mb-0.5">📞 {s.phone}</p>}
              {s.email && <p className="text-sm text-gray-400 mb-0.5 truncate">📧 {s.email}</p>}
              {s.gstin && <p className="text-xs text-gray-500 font-mono mt-2">GSTIN: {s.gstin}</p>}
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Purchases</span>
                <span className="text-sm font-bold text-sky-400">₹{(s.totalPurchases || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Supplier Name *</label>
            <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. Reliance Mart Wholesale" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Person</label>
              <input className="input" value={form.contactPerson} onChange={f('contactPerson')} placeholder="Mr. Ramesh" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={f('email')} placeholder="supplier@mail.com" />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input className="input font-mono" value={form.gstin} onChange={f('gstin')} placeholder="27AAPFU0939F1ZV" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} value={form.address} onChange={f('address')} placeholder="Full address" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={f('notes')} placeholder="Payment terms, delivery schedule…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving…' : editItem ? 'Update' : 'Add Supplier'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
