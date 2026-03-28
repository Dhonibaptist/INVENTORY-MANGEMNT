import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      owner: { email: 'owner@smartstore.com', password: 'password123' },
      manager: { email: 'manager@smartstore.com', password: 'password123' },
      cashier: { email: 'cashier@smartstore.com', password: 'password123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-900/30 via-gray-900 to-violet-900/30 border-r border-gray-800 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center font-bold text-white">S</div>
          <span className="font-bold text-white text-lg">Smart Store Manager</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Your store,<br />
            <span className="text-sky-400">fully digitized.</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: '📦', text: 'Real-time inventory tracking & expiry alerts' },
              { icon: '🧾', text: 'Fast POS billing with PDF invoice generation' },
              { icon: '📊', text: 'Profit & loss reports, sales analytics' },
              { icon: '🔔', text: 'Automated cron jobs for daily summaries' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">© 2024 Smart Store Manager. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center font-bold text-white text-sm">S</div>
              <span className="font-bold text-white">Smart Store Manager</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {['owner', 'manager', 'cashier'].map(role => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold capitalize border border-gray-700 text-gray-300 hover:border-sky-500 hover:text-sky-400 transition-all"
                >
                  {role === 'owner' ? '👑' : role === 'manager' ? '🗂️' : '🧾'} {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Default Demo Credentials</p>
            <div className="space-y-1 font-mono text-xs text-gray-400">
              <p>owner@smartstore.com / password123</p>
              <p>manager@smartstore.com / password123</p>
              <p>cashier@smartstore.com / password123</p>
            </div>
            <p className="text-xs text-amber-400 mt-2">⚠ Seed the database first — see README</p>
          </div>
        </div>
      </div>
    </div>
  );
}
