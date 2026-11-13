import { CalendarDays, Users, MapPin, UtensilsCrossed } from 'lucide-react'
import Badge from './Badge'
import Img from './Img'
import { fmtDateTime, inr } from '../../utils/format'
/** Shared by customer and chef views. `who` picks which counterpart name/photo to show. */
export default function BookingCard({ b, who = 'chef', actions }) {
  const name = who === 'chef' ? b.chef_name : b.customer_name
  return <article className="card flex flex-col gap-4 p-5 sm:flex-row">
    {who === 'chef' ? <Img src={b.chef_photo} alt={name || 'Chef'} className="h-24 w-24 shrink-0 rounded-xl" /> : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-brand-50 font-display text-3xl font-bold text-brand-600">{(name || '?')[0]}</div>}
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg">{name || 'Booking #' + b.id}</h3><Badge tone={b.status}>{b.status}</Badge></div>
      <p className="text-sm font-medium text-ink-800">{b.service_type}</p>
      <ul className="grid gap-x-6 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
        <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" />{fmtDateTime(b.event_date)}</li>
        <li className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" />{b.guests} guests</li>
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{b.location}</span></li>
        {b.cuisine && <li className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4 shrink-0" />{b.cuisine}</li>}</ul>
      {b.notes && <p className="rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-700">“{b.notes}”</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1"><p className="text-sm text-ink-700">Estimated <b className="text-base text-ink-900">{inr(b.estimated_price)}</b></p><div className="flex flex-wrap gap-2">{actions}</div></div>
    </div></article>
}
