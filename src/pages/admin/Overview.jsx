import { Link } from 'react-router-dom'
import { Users, ChefHat, BadgeCheck, ClipboardList, Wallet, Hourglass } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import DashHeader from '../../components/common/DashHeader'
import StatCard from '../../components/common/StatCard'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import Button from '../../components/common/Button'
import useAsync from '../../hooks/useAsync'
import { adminService } from '../../services/adminService'
import { inr } from '../../utils/format'

const COLORS = { Pending: '#f59e0b', Accepted: '#3b82f6', Completed: '#16a34a', Rejected: '#ef4444', Cancelled: '#9ca3af' }
export default function AdminOverview() {
  const { data: s, loading, error, reload } = useAsync(() => adminService.stats(), [])
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!s && loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-28" /><Skeleton className="h-72" /></div>
  return <>
    <DashHeader title="Admin overview" text="Platform health at a glance." action={s.pendingChefs > 0 && <Link to="/admin/chefs"><Button>Review {s.pendingChefs} pending chef{s.pendingChefs > 1 ? 's' : ''}</Button></Link>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard icon={Users} label="Total users" value={s.users} hint={`${s.customers} customers`} />
      <StatCard icon={ChefHat} label="Chefs" value={s.chefs} hint={`${s.verifiedChefs} verified`} tone="blue" />
      <StatCard icon={Hourglass} label="Awaiting approval" value={s.pendingChefs} tone="amber" />
      <StatCard icon={BadgeCheck} label="Verified chefs" value={s.verifiedChefs} tone="green" />
      <StatCard icon={ClipboardList} label="Bookings" value={s.bookings} />
      <StatCard icon={Wallet} label="Completed value" value={inr(s.revenue)} tone="green" /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="card p-6"><h2 className="mb-4 text-xl">Bookings by status</h2>{s.byStatus.length === 0 ? <p className="py-16 text-center text-sm text-ink-700">No bookings yet.</p> :
        <div className="h-64"><ResponsiveContainer><PieChart><Pie data={s.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{s.byStatus.map((e) => <Cell key={e.name} fill={COLORS[e.name] || '#d9561f'} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>}</div>
      <div className="card p-6"><h2 className="mb-4 text-xl">Bookings by event month</h2>{s.monthly.length === 0 ? <p className="py-16 text-center text-sm text-ink-700">No bookings yet.</p> :
        <div className="h-64"><ResponsiveContainer><BarChart data={s.monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Bookings" fill="#d9561f" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>}</div></div>
    {s.bookings === 0 && <p className="mt-4 text-xs text-ink-700/70">Booking figures appear once the bookings API is available (Phase 4).</p>}</>
}
