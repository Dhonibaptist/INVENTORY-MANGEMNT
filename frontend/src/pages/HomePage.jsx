import { Link } from 'react-router-dom';

const features = [
  { icon: '📦', title: 'Smart Inventory', desc: 'Real-time stock tracking, expiry alerts, and automated reorder notifications to keep your shelves optimized.' },
  { icon: '🧾', title: 'POS Billing', desc: 'Blazing-fast point-of-sale with barcode scanning, multi-payment modes, and instant PDF invoice generation.' },
  { icon: '🏭', title: 'Supplier Management', desc: 'Track suppliers, create purchase orders, and find the cheapest source for every product automatically.' },
  { icon: '📊', title: 'Sales Analytics', desc: 'Detailed charts, revenue trends, top-product rankings, and dead-stock identification at a glance.' },
  { icon: '💰', title: 'Profit & Loss', desc: 'Know your exact margins, COGS, and profitability per period with automated financial statements.' },
  { icon: '🔔', title: 'Automated Alerts', desc: 'Cron-powered midnight and evening jobs ensure you never miss an expiry or stock emergency.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Owner, Manager, and Cashier roles with granular permission control across all modules.' },
  { icon: '📈', title: 'Dead Stock Detection', desc: 'Automatically flags products not sold in 30+ days so you can run clearance campaigns.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center font-bold text-white">S</div>
          <span className="font-bold text-white text-lg">Smart Store Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link to="/login" className="btn-primary text-sm">Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-8 tracking-widest uppercase">
            ✦ Full-Stack Store Management Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-white">Smart Store</span><br />
            <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">Manager</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace pen-and-paper with a unified digital dashboard. Manage inventory, billing, suppliers, and analytics — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="btn-primary px-8 py-3 text-base">Start Managing →</Link>
            <a href="#problem" className="btn-secondary px-8 py-3 text-base">Learn More ↓</a>
          </div>
        </div>

        {/* Floating stats */}
        <div className="relative z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto w-full">
          {[
            { label: 'Inventory Tracked', value: '∞ Products' },
            { label: 'Billing Mode', value: 'POS + PDF' },
            { label: 'Alert System', value: 'Automated' },
            { label: 'Access Levels', value: '3 Roles' },
          ].map((s, i) => (
            <div key={i} className="card text-center py-4 hover:border-gray-700 transition-colors">
              <p className="text-lg font-bold text-sky-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement — highlighted */}
      <section id="problem" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-gray-900 to-red-500/5 p-10 md:p-16">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            <div className="absolute top-6 right-6 text-6xl opacity-10">⚠️</div>

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-bold mb-6 uppercase tracking-widest">
              Problem Statement
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Local Retailers Are Losing Revenue<br />
              <span className="text-amber-400">Every Single Day</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 text-gray-300 leading-relaxed">
              <div>
                <p className="mb-4">
                  <strong className="text-white">The Supply Side:</strong> Local retailers face persistent challenges clearing <span className="text-amber-400 font-semibold">overstocked or near-expiry inventory</span> due to limited digital presence and visibility. Without proper tracking systems, products expire on shelves — resulting in direct financial losses.
                </p>
                <p>
                  <strong className="text-white">The Demand Side:</strong> Meanwhile, nearby customers remain completely unaware of these time-sensitive deals, missing out on potential savings. The lack of effective discovery platforms further widens the gap between supply and demand at a hyperlocal level.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  <strong className="text-white">The Operational Gap:</strong> Most small store owners still rely on <span className="text-red-400 font-semibold">pen-and-paper systems</span> for inventory management, billing, and supplier tracking. This leads to stockouts, overstocking, billing errors, and missed profit opportunities.
                </p>
                <p>
                  <strong className="text-white">The Solution:</strong> Smart Store Manager is a comprehensive digital platform that <span className="text-emerald-400 font-semibold">bridges this gap</span> — enabling real-time inventory control, automated alerts, and data-driven decision making for every local retailer.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Revenue Lost to Expired Stock', val: '↑ 23%', color: 'text-red-400' },
                { label: 'Manual Entry Errors Eliminated', val: '↓ 95%', color: 'text-emerald-400' },
                { label: 'Inventory Accuracy Improvement', val: '↑ 40%', color: 'text-sky-400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-700">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Run Your Store</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From stocking shelves to generating profit reports — Smart Store Manager handles it all.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="card hover:border-gray-700 transition-all duration-200 hover:-translate-y-1 group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-sky-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System flow */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Complete end-to-end flow from supplier to customer</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Buying Side', desc: 'Add suppliers → Create purchase orders → Receive goods → Auto-update inventory → Track cheapest supplier.', color: 'sky' },
              { step: '02', title: 'Selling Side', desc: 'POS billing with barcode scan → Add to cart → Apply tax & discount → Generate PDF invoice → Deduct stock automatically.', color: 'violet' },
              { step: '03', title: 'Automation', desc: 'Midnight cron checks expiry dates. 9PM job sends daily sales summary, low stock alerts, and expiry warnings.', color: 'emerald' },
            ].map((s, i) => (
              <div key={i} className="card border border-gray-800">
                <div className={`text-xs font-mono font-bold mb-3 ${s.color === 'sky' ? 'text-sky-400' : s.color === 'violet' ? 'text-violet-400' : 'text-emerald-400'}`}>{s.step}</div>
                <h3 className="font-bold text-white text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Digitize Your Store?</h2>
          <p className="text-gray-400 mb-8">Join the platform built specifically for local retailers who want to run smarter businesses.</p>
          <Link to="/login" className="btn-primary px-10 py-4 text-base inline-block">Get Started Free →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="text-gray-400 text-sm font-medium">Smart Store Manager</span>
          </div>
          <p className="text-gray-600 text-xs">Built with React + Node.js + MongoDB Atlas. Deployable on Vercel + Render.</p>
        </div>
      </footer>
    </div>
  );
}
