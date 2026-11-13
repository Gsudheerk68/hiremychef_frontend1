import { useState } from 'react'
import DashHeader from '../../components/common/DashHeader'
import Tabs from '../../components/common/Tabs'
import BookingCard from '../../components/common/BookingCard'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import { useToast } from '../../context/ToastContext'
import { bookingsService } from '../../services/bookingsService'

const TABS = { Pending: ['Pending'], Upcoming: ['Accepted'], Completed: ['Completed'], Closed: ['Rejected', 'Cancelled'] }
const VERB = { accept: 'accepted', reject: 'declined', complete: 'marked as completed' }
export default function ChefRequests() {
  const me = useIdentity(); const toast = useToast()
  const { data, loading, error, reload } = useAsync(() => bookingsService.list(me), [me.chefId])
  const [tab, setTab] = useState('Pending'); const [confirm, setConfirm] = useState(null); const [busy, setBusy] = useState(false)
  const list = data || []
  const counts = Object.fromEntries(Object.entries(TABS).map(([k, v]) => [k, list.filter((b) => v.includes(b.status)).length]))
  const run = async (b, action) => {
    setBusy(true)
    try { await bookingsService.act(b.id, action); toast(`Booking ${VERB[action]}`); setConfirm(null); reload() } catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  const shown = list.filter((b) => TABS[tab].includes(b.status))
  return <>
    <DashHeader title="Booking requests" text="Accept or decline requests and mark events as completed." />
    <Tabs tabs={Object.keys(TABS)} value={tab} onChange={setTab} counts={counts} />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      : shown.length === 0 ? <EmptyState icon="📭" title={`No ${tab.toLowerCase()} bookings`} text="They will appear here as customers book you." />
      : <div className="space-y-4">{shown.map((b) => <BookingCard key={b.id} b={b} who="customer" actions={<>
        {b.status === 'Pending' && <><Button variant="secondary" size="sm" onClick={() => setConfirm({ b, action: 'reject' })}>Decline</Button><Button size="sm" onClick={() => run(b, 'accept')} loading={busy}>Accept</Button></>}
        {b.status === 'Accepted' && <Button size="sm" onClick={() => setConfirm({ b, action: 'complete' })}>Mark completed</Button>}</>} />)}</div>}
    <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.action === 'reject' ? 'Decline this request?' : 'Mark as completed?'}>
      <p className="text-sm text-ink-700">{confirm?.action === 'reject' ? `${confirm?.b.customer_name || 'The customer'} will be told you cannot take this booking.` : 'Confirm the event took place. The customer can then leave a review.'}</p>
      <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setConfirm(null)}>Back</Button><Button loading={busy} onClick={() => run(confirm.b, confirm.action)}>Confirm</Button></div></Modal></>
}
