import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { iso, todayISO } from '../../utils/format'
/**
 * Month grid. blocked / booked are arrays of 'YYYY-MM-DD'. `selected` (array) + onToggle(day) make days clickable.
 * Past days and days in `disabled` are never clickable.
 */
export default function Calendar({ blocked = [], booked = [], selected = [], onToggle, disabled = [], months = 1 }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const today = todayISO(), B = new Set(blocked), K = new Set(booked), S = new Set(selected), D = new Set(disabled)
  const render = (offset) => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1)
    const lead = first.getDay(), count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(new Date(first.getFullYear(), first.getMonth(), i + 1)))]
    return <div key={offset} className="min-w-0 flex-1">
      <p className="mb-2 text-center font-display text-lg font-semibold text-ink-900">{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-700">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{cells.map((day, i) => {
        if (!day) return <span key={i} />
        const past = day < today, isB = B.has(day), isK = K.has(day), sel = S.has(day)
        const clickable = onToggle && !past && !isK && !D.has(day)
        const cls = sel ? 'bg-brand-600 text-white' : isK ? 'bg-blue-100 text-blue-800' : isB ? 'bg-red-100 text-red-700 line-through' : past ? 'text-ink-700/30' : 'bg-green-50 text-green-800'
        return <button type="button" key={day} disabled={!clickable} onClick={() => onToggle(day)} aria-pressed={onToggle ? sel : undefined}
          aria-label={`${day}${isK ? ', booked' : isB ? ', blocked' : ''}`} className={`aspect-square rounded-lg text-sm ${cls} ${clickable ? 'hover:ring-2 hover:ring-brand-400' : 'cursor-default'} ${day === today ? 'font-bold ring-1 ring-ink-800' : ''}`}>{+day.slice(8)}</button>
      })}</div></div>
  }
  return <div>
    <div className="mb-3 flex items-center justify-between">
      <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded-lg border border-cream-200 bg-white p-1.5"><ChevronLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded-lg border border-cream-200 bg-white p-1.5"><ChevronRight className="h-4 w-4" /></button></div>
    <div className="flex flex-col gap-6 sm:flex-row">{Array.from({ length: months }, (_, i) => render(i))}</div>
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700">
      <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-50 ring-1 ring-green-200" />Available</li>
      <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-100" />Unavailable</li>
      <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-100" />Booked</li>
      {onToggle && <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-600" />Selected</li>}</ul></div>
}
