import { Wallet, Clock, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import DashHeader from '../../components/common/DashHeader'
import StatCard from '../../components/common/StatCard'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import { bookingsService } from '../../services/bookingsService'
import { inr, fmtDate } from '../../utils/format'

export default function Earnings() {
  const me = useIdentity()
  const { data, loading, error, reload } = useAsync(() => bookingsService.list(me), [me.chefId])
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data && loading) return <Skeleton className="h-96" />
  const done = data.filter((b) => b.status === 'Completed'), upcoming = data.filter((b) => b.status === 'Accepted')
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString('en-IN', { month: 'short' }), earned: 0 } })
  done.forEach((b) => { const d = new Date(b.event_date), m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`); if (m) m.earned += b.estimated_price })
  return <>
    <DashHeader title="Earnings" text="Based on the estimated price of completed bookings." />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard icon={Wallet} label="Total earned" value={inr(done.reduce((s, b) => s + b.estimated_price, 0))} tone="green" />
      <StatCard icon={Clock} label="Confirmed, not yet done" value={inr(upcoming.reduce((s, b) => s + b.estimated_price, 0))} tone="blue" />
      <StatCard icon={CheckCircle2} label="Events completed" value={done.length} /></div>
    <div className="card mt-6 p-6"><h2 className="mb-4 text-xl">Last 6 months</h2>
      <div className="h-72"><ResponsiveContainer><BarChart data={months}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} /><Tooltip formatter={(v) => inr(v)} /><Bar dataKey="earned" name="Earned" fill="#d9561f" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
    <div className="card mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-cream-200 text-ink-700"><tr><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Event</th><th className="p-4 text-right">Amount</th></tr></thead>
      <tbody>{done.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-ink-700">No completed bookings yet.</td></tr> : done.map((b) => <tr key={b.id} className="border-b border-cream-200 last:border-0"><td className="p-4">{fmtDate(b.event_date)}</td><td className="p-4">{b.customer_name}</td><td className="p-4">{b.service_type}</td><td className="p-4 text-right font-semibold">{inr(b.estimated_price)}</td></tr>)}</tbody></table></div></>
}
