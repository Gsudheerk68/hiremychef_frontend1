import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, CheckCircle2, Heart, Sparkles, Search } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import StatCard from '../../components/common/StatCard'
import ChefCard from '../../components/common/ChefCard'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import BookingCard from '../../components/common/BookingCard'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import useFavorites from '../../hooks/useFavorites'
import { bookingsService } from '../../services/bookingsService'
import { chefsService } from '../../services/chefsService'

export default function CustomerOverview() {
  const me = useIdentity(); const fav = useFavorites()
  const bq = useAsync(() => bookingsService.list(me), [me.userId])
  const rq = useAsync(() => chefsService.recommended(4).catch(() => []), [])
  const list = bq.data || [], by = (s) => list.filter((b) => b.status === s)
  const next = [...by('Accepted'), ...by('Pending')].filter((b) => new Date(b.event_date) >= new Date()).sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0]
  return <>
    <DashHeader title={`Hello, ${me.name?.split(' ')[0] || 'there'} 👋`} text="Here is what is happening with your bookings."
      action={<div className="flex gap-2"><Link to="/chefs"><Button><Search className="h-4 w-4" />Find a chef</Button></Link><Link to="/customer/ai"><Button variant="secondary"><Sparkles className="h-4 w-4" />Ask AI</Button></Link></div>} />
    {bq.error ? <ErrorState message={bq.error} onRetry={bq.reload} /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Pending requests" value={by('Pending').length} tone="amber" />
        <StatCard icon={CalendarCheck} label="Confirmed events" value={by('Accepted').length} tone="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={by('Completed').length} tone="green" />
        <StatCard icon={Heart} label="Favourite chefs" value={fav.ids.length} />
      </div>
      <h2 className="mb-3 mt-8 text-2xl">Next event</h2>
      {bq.loading && !bq.data ? <Skeleton className="h-36" /> : next ? <BookingCard b={next} actions={<Link to="/customer/bookings"><Button variant="secondary" size="sm">Manage</Button></Link>} />
        : <EmptyState icon="📅" title="No upcoming events" text="Find a chef and book your next dinner or party." action={<Link to="/chefs"><Button>Explore chefs</Button></Link>} />}
    </>}
    <div className="mb-3 mt-8 flex items-end justify-between"><h2 className="text-2xl">Recommended for you</h2><Link to="/chefs" className="text-sm font-semibold text-brand-600">See all</Link></div>
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{rq.data ? rq.data.map((c) => <ChefCard key={c.id} chef={c} fav={fav.ids.includes(c.id)} onToggleFav={fav.toggle} />) : [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80" />)}</div>
  </>
}
