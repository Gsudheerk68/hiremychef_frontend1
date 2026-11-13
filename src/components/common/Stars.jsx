import { Star } from 'lucide-react'
/** Read-only when onChange is omitted; otherwise a clickable 1-5 rating input. */
export default function Stars({ value = 0, onChange, size = 'h-4 w-4' }) {
  return <div className="flex items-center" role={onChange ? 'radiogroup' : 'img'} aria-label={`Rating ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => {
      const icon = <Star className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-cream-200'}`} />
      return onChange ? <button type="button" key={i} role="radio" aria-checked={i === value} aria-label={`${i} star${i > 1 ? 's' : ''}`} onClick={() => onChange(i)} className="p-0.5">{icon}</button> : <span key={i}>{icon}</span>
    })}</div>
}
