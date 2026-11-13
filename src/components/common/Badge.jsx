const T = { Pending:'bg-amber-100 text-amber-800', Accepted:'bg-blue-100 text-blue-800', Completed:'bg-green-100 text-green-800', Rejected:'bg-red-100 text-red-800', Cancelled:'bg-gray-200 text-gray-700', default:'bg-brand-50 text-brand-700' }
export default function Badge({ tone='default', children }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${T[tone] || T.default}`}>{children}</span>
}
