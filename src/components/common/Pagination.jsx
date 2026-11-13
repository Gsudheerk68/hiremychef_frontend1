import { ChevronLeft, ChevronRight } from 'lucide-react'
export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  const b = 'grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium disabled:opacity-40'
  return <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
    <button className={`${b} border-cream-200 bg-white`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
    {nums.map((n, i) => <span key={n} className="flex items-center gap-1.5">{i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink-700">…</span>}
      <button className={`${b} ${n === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-cream-200 bg-white'}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button></span>)}
    <button className={`${b} border-cream-200 bg-white`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
  </nav>
}
