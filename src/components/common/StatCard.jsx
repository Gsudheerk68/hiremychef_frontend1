export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const t = { brand: 'bg-brand-50 text-brand-600', green: 'bg-green-50 text-green-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700' }[tone]
  return <div className="card flex items-center gap-4 p-5">
    {Icon && <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${t}`}><Icon className="h-6 w-6" /></div>}
    <div className="min-w-0"><p className="text-sm text-ink-700">{label}</p><p className="font-display text-2xl font-bold text-ink-900">{value}</p>{hint && <p className="text-xs text-ink-700/70">{hint}</p>}</div></div>
}
