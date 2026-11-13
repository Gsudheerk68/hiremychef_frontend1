import { forwardRef, useId } from 'react'
const Select = forwardRef(({ label, error, className = '', children, ...p }, ref) => {
  const id = useId()
  return <div className={className}>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <select id={id} ref={ref} aria-invalid={!!error} className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm ${error ? 'border-red-500' : 'border-cream-200'} focus:border-brand-600`} {...p}>{children}</select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
})
export default Select
