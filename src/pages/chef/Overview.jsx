import { Link } from 'react-router-dom'
import { Inbox, CalendarCheck, Wallet, Star } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import StatCard from '../../components/common/StatCard'
import BookingCard from '../../components/common/BookingCard'
import Button from '../../components/common/Button'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import { useDash } from '../../layouts/DashboardLayout'
import { bookingsService } from '../../services/bookingsService'
import { inr } from '../../utils/format'

export default function ChefOverview() {
  const me = useIdentity(); const { chef } = useDash()
  const { data, loading, error, reload } = useAsync(() => bookingsService.list(me), [me.chefId])
  const list = data || [], by = (s) => list.filter((b) => b.status === s)
  const upcoming = by('Accepted').filter((b) => new Date(b.event_date) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
  const earned = by('Completed').reduce((s, b) => s + b.estimated_price, 0)
  return <>
    <DashHeader title={`Welcome, ${me.name?.split(' ')[0]}`} text="Your kitchen at a glance." action={<Link to="/chef/availability"><Button variant="secondary">Manage availability</Button></Link>} />
    {error ? <ErrorState message={error} onRetry={reload} /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} label="New requests" value={by('Pending').length} tone="amber" />
        <StatCard icon={CalendarCheck} label="Upcoming events" value={upcoming.length} tone="blue" />
        <StatCard icon={Wallet} label="Earned (completed)" value={inr(earned)} tone="green" />
        <StatCard icon={Star} label="Rating" value={chef.rating || '–'} hint={`${chef.reviews} reviews`} /></div>
      <div className="mb-3 mt-8 flex items-end justify-between"><h2 className="text-2xl">Needs your response</h2><Link to="/chef/bookings" className="text-sm font-semibold text-brand-600">All requests</Link></div>
      {loading && !data ? <Skeleton className="h-36" /> : by('Pending').length === 0 ? <EmptyState icon="📥" title="No pending requests" text="New booking requests will show up here." />
        : <div className="space-y-4">{by('Pending').slice(0, 3).map((b) => <BookingCard key={b.id} b={b} who="customer" actions={<Link to="/chef/bookings"><Button size="sm">Review request</Button></Link>} />)}</div>}
      <h2 className="mb-3 mt-8 text-2xl">Next events</h2>
      {upcoming.length === 0 ? <p className="text-sm text-ink-700">No confirmed events coming up.</p> : <div className="space-y-4">{upcoming.slice(0, 3).map((b) => <BookingCard key={b.id} b={b} who="customer" />)}</div>}</>}</>
}
