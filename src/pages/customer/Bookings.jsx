import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashHeader from '../../components/common/DashHeader'
import Tabs from '../../components/common/Tabs'
import BookingCard from '../../components/common/BookingCard'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Stars from '../../components/common/Stars'
import Textarea from '../../components/common/Textarea'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import { useToast } from '../../context/ToastContext'
import { bookingsService } from '../../services/bookingsService'
import { reviewsService } from '../../services/reviewsService'

const TABS = { All: null, Pending: ['Pending'], Upcoming: ['Accepted'], Completed: ['Completed'], 'Cancelled / Rejected': ['Cancelled', 'Rejected'] }
export default function CustomerBookings() {
  const me = useIdentity(); const toast = useToast(); const nav = useNavigate()
  const { data, loading, error, reload } = useAsync(() => bookingsService.list(me), [me.userId])
  const [tab, setTab] = useState('All'); const [cancel, setCancel] = useState(null); const [review, setReview] = useState(null); const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(5); const [comment, setComment] = useState('')
  const list = data || []
  const counts = Object.fromEntries(Object.entries(TABS).map(([k, v]) => [k, v ? list.filter((b) => v.includes(b.status)).length : list.length]))
  const shown = TABS[tab] ? list.filter((b) => TABS[tab].includes(b.status)) : list

  const doCancel = async () => {
    setBusy(true)
    try { await bookingsService.act(cancel.id, 'cancel'); toast('Booking cancelled'); setCancel(null); reload() } catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  const doReview = async () => {
    setBusy(true)
    try { await reviewsService.create({ booking_id: review.id, rating, comment: comment.trim() || null }, { user: { name: me.name } }); toast('Thanks for your review!'); setReview(null); setComment(''); setRating(5); reload() }
    catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  return <>
    <DashHeader title="My bookings" text="Track requests, manage upcoming events and review past ones." action={<Link to="/chefs"><Button>Book a chef</Button></Link>} />
    <Tabs tabs={Object.keys(TABS)} value={tab} onChange={setTab} counts={counts} />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      : shown.length === 0 ? <EmptyState icon="📋" title="No bookings here" text={tab === 'All' ? 'When you book a chef, your requests will appear here.' : 'Nothing in this category yet.'} action={<Link to="/chefs"><Button>Explore chefs</Button></Link>} />
      : <div className="space-y-4">{shown.map((b) => <BookingCard key={b.id} b={b} actions={<>
        <Button variant="ghost" size="sm" onClick={() => nav(`/customer/messages?chef=${b.chef_id}`)}>Message</Button>
        {['Pending', 'Accepted'].includes(b.status) && <Button variant="secondary" size="sm" onClick={() => setCancel(b)}>Cancel</Button>}
        {b.status === 'Completed' && !b.reviewed && <Button size="sm" onClick={() => setReview(b)}>Leave a review</Button>}
        {b.status === 'Completed' && b.reviewed && <span className="self-center text-xs font-semibold text-green-700">Reviewed ✓</span>}</>} />)}</div>}

    <Modal open={!!cancel} onClose={() => setCancel(null)} title="Cancel this booking?">
      <p className="text-sm text-ink-700">Your request to {cancel?.chef_name} will be cancelled. This cannot be undone.</p>
      <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setCancel(null)}>Keep booking</Button><Button loading={busy} onClick={doCancel}>Yes, cancel</Button></div></Modal>
    <Modal open={!!review} onClose={() => setReview(null)} title={`Review ${review?.chef_name || 'chef'}`}>
      <div className="space-y-4"><div><span className="label">Your rating</span><Stars value={rating} onChange={setRating} size="h-8 w-8" /></div>
        <Textarea label="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the food and service?" maxLength={1000} />
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setReview(null)}>Not now</Button><Button loading={busy} onClick={doReview}>Submit review</Button></div></div></Modal>
  </>
}
