import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, BadgeCheck, Award, Heart, MessageSquare, CalendarCheck, ArrowLeft, Clock } from 'lucide-react'
import Img from '../../components/common/Img'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Stars from '../../components/common/Stars'
import Calendar from '../../components/common/Calendar'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import useFavorites from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { chefsService } from '../../services/chefsService'
import { reviewsService } from '../../services/reviewsService'
import { chefMenus } from '../../data/menus'
import { inr, fmtDate } from '../../utils/format'

const Section = ({ title, children }) => <section className="card p-6"><h2 className="mb-4 text-2xl">{title}</h2>{children}</section>

export default function ChefDetails() {
  const { id } = useParams(); const nav = useNavigate(); const { user } = useAuth(); const fav = useFavorites()
  const chefQ = useAsync(() => chefsService.get(id), [id])
  const revQ = useAsync(() => reviewsService.forChef(id).catch(() => []), [id])
  const avQ = useAsync(() => chefsService.availability(id).catch(() => ({ blocked: [], booked: [] })), [id])
  const chef = chefQ.data
  if (chefQ.error) return <div className="container-x section">{/not found/i.test(chefQ.error)
    ? <EmptyState icon="🍳" title="Chef not found" text="This profile does not exist or is not public yet." action={<Link to="/chefs"><Button>Browse chefs</Button></Link>} />
    : <ErrorState message={chefQ.error} onRetry={chefQ.reload} />}</div>
  if (!chef) return <div className="container-x section grid gap-6 lg:grid-cols-3"><Skeleton className="h-96 lg:col-span-2" /><Skeleton className="h-72" /></div>

  const isCustomer = user?.role === 'customer', isFav = fav.ids.includes(chef.id)
  const book = () => user ? nav(`/customer/book/${chef.id}`) : nav('/login', { state: { from: { pathname: `/customer/book/${chef.id}` } } })
  const reviews = revQ.data || []

  return <div className="container-x section pt-6">
    <Link to="/chefs" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><ArrowLeft className="h-4 w-4" />All chefs</Link>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card overflow-hidden"><div className="grid sm:grid-cols-[260px_1fr]">
          <Img src={chef.photo} alt={`Chef ${chef.name}`} className="h-64 w-full sm:h-full" />
          <div className="space-y-3 p-6">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl">{chef.name}</h1>{chef.verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}</div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{chef.city || 'Location not set'}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{chef.years} years experience</span></p>
            <div className="flex items-center gap-2"><Stars value={chef.rating} /><span className="text-sm font-semibold">{chef.rating}</span><span className="text-sm text-ink-700">({chef.reviews} reviews)</span></div>
            <div className="flex flex-wrap gap-1.5">{chef.cuisines.map((c) => <Badge key={c}>{c}</Badge>)}</div>
            <Badge tone={chef.available ? 'Completed' : 'Cancelled'}>{chef.available ? 'Accepting bookings' : 'Currently fully booked'}</Badge></div></div></div>

        <Section title="About"><p className="leading-relaxed text-ink-700">{chef.bio || 'This chef has not added a bio yet.'}</p></Section>
        {chef.certifications?.length > 0 && <Section title="Certifications"><ul className="grid gap-3 sm:grid-cols-2">{chef.certifications.map((c) => <li key={c} className="flex items-center gap-3 rounded-xl bg-cream-100 p-3 text-sm font-medium"><Award className="h-5 w-5 text-brand-600" />{c}</li>)}</ul></Section>}
        <Section title="Sample menus"><div className="grid gap-4 md:grid-cols-2">{chefMenus(chef.cuisines).map((m) => <div key={m.cuisine} className="rounded-xl border border-cream-200 p-4">
          <p className="mb-2 font-display text-lg font-semibold text-ink-900">{m.cuisine}</p>{m.courses.map((c) => <p key={c.name} className="mb-1 text-sm"><b>{c.name}:</b> <span className="text-ink-700">{c.items.join(', ')}</span></p>)}</div>)}</div>
          <p className="mt-3 text-xs text-ink-700/70">Sample menus only. Your chef will tailor the final menu to your needs.</p></Section>
        <Section title="Availability"><Calendar months={2} blocked={avQ.data?.blocked || []} booked={avQ.data?.booked || []} /></Section>
        <Section title={`Reviews (${reviews.length})`}>{revQ.loading && !revQ.data ? <Skeleton className="h-20" /> : reviews.length === 0 ? <p className="text-sm text-ink-700">No reviews yet. Be the first to book and review this chef.</p>
          : <ul className="divide-y divide-cream-200">{reviews.map((r) => <li key={r.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center justify-between"><p className="font-semibold">{r.customer_name || 'Customer'}</p><span className="text-xs text-ink-700">{fmtDate(r.created_at)}</span></div><Stars value={r.rating} />{r.comment && <p className="mt-1 text-sm text-ink-700">{r.comment}</p>}</li>)}</ul>}</Section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit"><div className="card space-y-4 p-6">
        <p><span className="font-display text-3xl font-bold text-ink-900">{inr(chef.price)}</span><span className="text-sm text-ink-700"> / session</span></p>
        <p className="text-xs text-ink-700">Covers up to 6 guests. You will see an exact estimate before you confirm.</p>
        <Button size="lg" className="w-full" onClick={book} disabled={user && !isCustomer}><CalendarCheck className="h-5 w-5" />Book this chef</Button>
        {user && !isCustomer && <p className="text-xs text-amber-700">Log in with a customer account to book chefs.</p>}
        {isCustomer && <>
          <Button variant="secondary" className="w-full" onClick={() => nav(`/customer/messages?chef=${chef.id}`)}><MessageSquare className="h-4 w-4" />Message chef</Button>
          <Button variant="ghost" className="w-full" onClick={() => fav.toggle(chef.id, !isFav)} aria-pressed={isFav}><Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />{isFav ? 'Saved to favourites' : 'Save to favourites'}</Button></>}
        <ul className="space-y-2 border-t border-dashed border-cream-200 pt-4 text-sm text-ink-700"><li>✓ Background-checked and approved</li><li>✓ Fresh cooking in your kitchen</li><li>✓ Chat with the chef before you decide</li></ul>
      </div></aside></div></div>
}
