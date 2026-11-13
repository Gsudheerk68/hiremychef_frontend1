import { forwardRef, useId } from 'react'
const Input = forwardRef(({ label, error, icon: Icon, className='', ...p }, ref) => {
  const id = useId()
  return <div className={className}>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/60" />}
      <input id={id} ref={ref} aria-invalid={!!error} className={`w-full rounded-xl border bg-white py-2.5 pr-3 text-sm ${Icon ? 'pl-9' : 'pl-3'} ${error ? 'border-red-500' : 'border-cream-200'} focus:border-brand-600`} {...p} />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
})
export default Input
