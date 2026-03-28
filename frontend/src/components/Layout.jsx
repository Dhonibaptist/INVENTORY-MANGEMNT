import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['owner','manager','cashier'] },
  { path: '/inventory', label: 'Inventory', icon: '📦', roles: ['owner','manager'] },
  { path: '/billing', label: 'POS Billing', icon: '🧾', roles: ['owner','manager','cashier'] },
  { path: '/suppliers', label: 'Suppliers', icon: '🏭', roles: ['owner','manager'] },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: '📋', roles: ['owner','manager'] },
  { path: '/sales', label: 'Sales Reports', icon: '📊', roles: ['owner','manager'] },
  { path: '/profit-loss', label: 'Profit & Loss', icon: '💰', roles: ['owner','manager'] },
  { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['owner','manager'] },
  { path: '/alerts', label: 'Alerts', icon: '🔔', roles: ['owner','manager','cashier'] },
  { path: '/users', label: 'Users & Roles', icon: '👥', roles: ['owner'] },
];

export default function Layout({ children }) {
  const { user, logout, isOwner, isManager } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out z-30`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">S</div>
          {sidebarOpen && <span className="font-bold text-white text-sm leading-tight">Smart Store<br /><span className="text-sky-400 font-normal text-xs">Manager</span></span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-800 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors text-xs p-1" title="Logout">✕</button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-red-400 transition-colors" title="Logout">✕</button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center gap-4 px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-100 transition-colors p-1"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span className={`badge ${
              user?.role === 'owner' ? 'bg-violet-500/20 text-violet-400' :
              user?.role === 'manager' ? 'bg-sky-500/20 text-sky-400' :
              'bg-green-500/20 text-green-400'
            }`}>{user?.role}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
