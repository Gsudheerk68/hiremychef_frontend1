export default function Tabs({ tabs, value, onChange, counts = {} }) {
  return <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-cream-200 p-1">{tabs.map((t) =>
    <button key={t} role="tab" aria-selected={value === t} onClick={() => onChange(t)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${value === t ? 'bg-white text-brand-700 shadow-soft' : 'text-ink-700 hover:text-ink-900'}`}>
      {t}{counts[t] != null && <span className="ml-1.5 text-xs opacity-70">{counts[t]}</span>}</button>)}</div>
}
