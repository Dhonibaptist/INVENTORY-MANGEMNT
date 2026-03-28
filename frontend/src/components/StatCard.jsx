export default function StatCard({ title, value, subtitle, icon, color = 'sky', trend }) {
  const colors = {
    sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  };
  const c = colors[color] || colors.sky;

  return (
    <div className={`stat-card border ${c.border}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        {icon && <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center text-lg`}>{icon}</div>}
      </div>
      <p className={`text-2xl font-bold ${c.text} mt-1`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {trend && (
        <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs yesterday
        </span>
      )}
    </div>
  );
}
