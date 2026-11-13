import { forwardRef, useId } from 'react'
const Textarea = forwardRef(({ label, error, hint, className = '', ...p }, ref) => {
  const id = useId()
  return <div className={className}>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <textarea id={id} ref={ref} rows={4} aria-invalid={!!error} className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm ${error ? 'border-red-500' : 'border-cream-200'} focus:border-brand-600`} {...p} />
    {hint && !error && <p className="mt-1 text-xs text-ink-700/70">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
})
export default Textarea
