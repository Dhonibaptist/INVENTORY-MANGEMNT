import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
  owner: { color: 'bg-violet-500/15 text-violet-400', icon: '👑', desc: 'Full access: financial reports, user management, all modules' },
  manager: { color: 'bg-sky-500/15 text-sky-400', icon: '🗂️', desc: 'Manage products, suppliers, view reports. Cannot manage users.' },
  cashier: { color: 'bg-emerald-500/15 text-emerald-400', icon: '🧾', desc: 'POS billing access only. Cannot view financial reports.' },
};

const EMPTY = { name: '', email: '', password: '', role: 'cashier', phone: '' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await userAPI.getAll(); setUsers(r.data.users); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (u) => { setEditItem(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) {
        const data = { name: form.name, role: form.role, phone: form.phone };
        await userAPI.update(editItem._id, data); toast.success('User updated');
      } else {
        await userAPI.create(form); toast.success('User created');
      }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await userAPI.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try { await userAPI.delete(id); toast.success('User deactivated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Roles</h1>
          <p className="text-gray-400 text-sm">{users.length} team members</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add User</button>
      </div>

      {/* Role reference */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <div key={role} className={`card border border-gray-800`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{meta.icon}</span>
              <span className={`badge capitalize font-semibold ${meta.color}`}>{role}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{meta.desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-5 py-3.5 text-gray-400 font-semibold">User</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Role</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Phone</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Status</th>
                <th className="text-left px-4 py-3.5 text-gray-400 font-semibold">Joined</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : users.map(u => {
                const meta = ROLE_META[u.role];
                const isCurrentUser = u._id === currentUser?.id;
                return (
                  <tr key={u._id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-gray-100 flex-shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">{u.name} {isCurrentUser && <span className="text-xs text-sky-400">(you)</span>}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge capitalize ${meta?.color}`}>{meta?.icon} {u.role}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${u.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3.5">
                      {!isCurrentUser && (
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)} className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors">Edit</button>
                          <button onClick={() => handleToggle(u)} className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. Priya Sharma" />
          </div>
          {!editItem && (
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={f('email')} required placeholder="user@store.com" />
            </div>
          )}
          {!editItem && (
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" value={form.password} onChange={f('password')} required placeholder="Min 6 characters" minLength={6} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={f('role')}>
                <option value="cashier">🧾 Cashier</option>
                <option value="manager">🗂️ Manager</option>
                <option value="owner">👑 Owner</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={f('phone')} placeholder="+91 9876543210" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving…' : editItem ? 'Update User' : 'Create User'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
