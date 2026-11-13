import { useState } from 'react'
import DashHeader from '../../components/common/DashHeader'
import Tabs from '../../components/common/Tabs'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import { adminService } from '../../services/adminService'
import { fmtDate, inr } from '../../utils/format'

const TABS = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled']
export default function AdminBookings() {
  const { data, loading, error, reload } = useAsync(() => adminService.bookings(), [])
  const [tab, setTab] = useState('All'); const list = data || [], rows = tab === 'All' ? list : list.filter((b) => b.status === tab)
  return <>
    <DashHeader title="All bookings" text="Every booking on the platform." />
    <Tabs tabs={TABS} value={tab} onChange={setTab} counts={Object.fromEntries(TABS.map((t) => [t, t === 'All' ? list.length : list.filter((b) => b.status === t).length]))} />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : <div className="card overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="border-b border-cream-200 text-ink-700"><tr><th className="p-4">#</th><th className="p-4">Event date</th><th className="p-4">Customer</th><th className="p-4">Chef</th><th className="p-4">Type</th><th className="p-4">Guests</th><th className="p-4 text-right">Estimate</th><th className="p-4">Status</th></tr></thead>
      <tbody>{rows.length === 0 ? <tr><td colSpan="8" className="p-6 text-center text-ink-700">{list.length === 0 ? 'No bookings yet, or the bookings API is not available yet.' : 'No bookings in this status.'}</td></tr>
        : rows.map((b) => <tr key={b.id} className="border-b border-cream-200 last:border-0"><td className="p-4 text-ink-700">#{b.id}</td><td className="whitespace-nowrap p-4">{fmtDate(b.event_date)}</td><td className="p-4">{b.customer_name}</td><td className="p-4">{b.chef_name}</td><td className="p-4">{b.service_type}</td><td className="p-4">{b.guests}</td><td className="p-4 text-right font-semibold">{inr(b.estimated_price)}</td><td className="p-4"><Badge tone={b.status}>{b.status}</Badge></td></tr>)}</tbody></table></div>}</>
}
