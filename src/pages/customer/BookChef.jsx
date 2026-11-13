import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, CalendarDays } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import Img from '../../components/common/Img'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { chefsService } from '../../services/chefsService'
import { bookingsService } from '../../services/bookingsService'
import { SERVICES, estimatePrice, INCLUDED_GUESTS } from '../../utils/pricing'
import { inr, todayISO, fmtDate } from '../../utils/format'

export default function BookChef() {
  const { chefId } = useParams(); const nav = useNavigate(); const toast = useToast(); const { user } = useAuth()
  const chefQ = useAsync(() => chefsService.get(chefId), [chefId])
  const avQ = useAsync(() => chefsService.availability(chefId).catch(() => ({ blocked: [], booked: [] })), [chefId])
  const [f, setF] = useState({ service_type: SERVICES[0].name, date: '', time: '19:00', guests: 4, cuisine: '', location: '', notes: '' })
  const [err, setErr] = useState({}); const [busy, setBusy] = useState(false); const [est, setEst] = useState(null)
  const chef = chefQ.data
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  useEffect(() => { if (chef && !f.cuisine) setF((x) => ({ ...x, cuisine: chef.cuisines[0] || '' })) }, [chef]) // eslint-disable-line react-hooks/exhaustive-deps

  // Estimate: shown instantly from the local formula, then replaced by the server's figure when the API provides one.
  const local = chef ? estimatePrice(chef.price, f.guests, f.service_type) : null
  useEffect(() => {
    if (!chef) return
    let alive = true; setEst(null)
    const t = setTimeout(() => bookingsService.estimate({ chef, guests: Number(f.guests) || 1, service_type: f.service_type }).then((r) => alive && setEst(r)), 300)
    return () => { alive = false; clearTimeout(t) }
  }, [chef, f.guests, f.service_type])
  const price = est || local
  const unavailable = new Set([...(avQ.data?.blocked || []), ...(avQ.data?.booked || [])])

  const validate = () => {
    const e = {}
    if (!f.date) e.date = 'Choose a date'; else if (f.date < todayISO()) e.date = 'Date cannot be in the past'; else if (unavailable.has(f.date)) e.date = 'The chef is not available on this date'
    const g = Number(f.guests); if (!Number.isInteger(g) || g < 1 || g > 200) e.guests = 'Enter 1 to 200 guests'
    if (f.location.trim().length < 5) e.location = 'Enter the full address of the event'
    if (f.notes.length > 500) e.notes = 'Keep notes under 500 characters'
    setErr(e); return !Object.keys(e).length
  }
  const submit = async (ev) => {
    ev.preventDefault(); if (!validate()) return
    setBusy(true)
    try {
      await bookingsService.create({ chef_id: chef.id, service_type: f.service_type, event_date: `${f.date}T${f.time || '12:00'}:00`, guests: Number(f.guests), cuisine: f.cuisine || null,
        location: f.location.trim(), notes: f.notes.trim() || null, estimated_price: price.total }, { chef, user })
      toast('Booking request sent. The chef will respond shortly.'); nav('/customer/bookings')
    } catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }

  if (chefQ.error) return <ErrorState message={chefQ.error} onRetry={chefQ.reload} />
  if (!chef) return <Skeleton className="h-96" />
  return <>
    <Link to={`/chefs/${chef.id}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"><ArrowLeft className="h-4 w-4" />Back to profile</Link>
    <DashHeader title={`Book ${chef.name}`} text="Tell us about your event. The chef reviews your request and confirms." />
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form onSubmit={submit} noValidate className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Event type" value={f.service_type} onChange={set('service_type')}>{SERVICES.map((s) => <option key={s.name}>{s.name}</option>)}</Select>
          <Select label="Cuisine" value={f.cuisine} onChange={set('cuisine')}>{chef.cuisines.map((c) => <option key={c}>{c}</option>)}<option value="">Chef’s choice</option></Select>
          <Input label="Date" type="date" min={todayISO()} value={f.date} error={err.date} onChange={set('date')} />
          <Input label="Start time" type="time" value={f.time} onChange={set('time')} />
          <Input label="Number of guests" type="number" min="1" max="200" icon={Users} value={f.guests} error={err.guests} onChange={set('guests')} />
          <Input label="Event address" icon={MapPin} placeholder="House no., street, area, city" value={f.location} error={err.location} onChange={set('location')} /></div>
        <Textarea label="Special requests (optional)" placeholder="Allergies, spice level, dishes you love…" value={f.notes} error={err.notes} onChange={set('notes')} hint={`${f.notes.length}/500`} />
        <Button type="submit" size="lg" loading={busy} className="w-full sm:w-auto">Send booking request</Button>
        <p className="text-xs text-ink-700">You are not charged by this request. The chef must accept it first, and you can cancel from your bookings page.</p>
      </form>
      <aside className="card h-fit space-y-4 p-6 xl:sticky xl:top-8">
        <div className="flex items-center gap-3"><Img src={chef.photo} alt={chef.name} className="h-16 w-16 rounded-xl" /><div><p className="font-display text-lg font-semibold text-ink-900">{chef.name}</p><p className="text-sm text-ink-700">{chef.city} · ⭐ {chef.rating}</p></div></div>
        <dl className="space-y-2 border-t border-dashed border-cream-200 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-700">Base price (up to {INCLUDED_GUESTS} guests)</dt><dd>{inr(price.base)}</dd></div>
          {price.extraGuests > 0 && <div className="flex justify-between"><dt className="text-ink-700">{price.extraGuests} extra guests</dt><dd>+{inr(price.extraCost)}</dd></div>}
          {price.factor !== 1 && <div className="flex justify-between"><dt className="text-ink-700">{f.service_type} (×{price.factor})</dt><dd>{price.factor > 1 ? '+' : '−'}{inr(Math.abs(Math.round((price.base + price.extraCost) * (price.factor - 1))))}</dd></div>}
          <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold"><dt>Estimated total</dt><dd className="text-brand-700">{inr(price.total)}</dd></div></dl>
        {f.date && <p className="flex items-center gap-2 rounded-lg bg-cream-100 p-3 text-sm"><CalendarDays className="h-4 w-4" />{fmtDate(f.date)} at {f.time}</p>}
        <p className="text-xs text-ink-700/80">This is an estimate. Confirm the final amount and any ingredient costs with your chef.</p>
      </aside></div></>
}
