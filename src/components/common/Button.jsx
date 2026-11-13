import { Loader2 } from 'lucide-react'
const V = {
  primary:'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary:'bg-white text-ink-800 border border-cream-200 hover:border-brand-600',
  dark:'bg-ink-900 text-white hover:bg-ink-700',
  ghost:'text-ink-800 hover:bg-cream-200',
}
const S = { sm:'px-3.5 py-2 text-sm', md:'px-5 py-2.5 text-sm', lg:'px-7 py-3.5 text-base' }
export default function Button({ variant='primary', size='md', loading, className='', children, ...p }) {
  return <button disabled={loading || p.disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-60 ${V[variant]} ${S[size]} ${className}`} {...p}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>
}
