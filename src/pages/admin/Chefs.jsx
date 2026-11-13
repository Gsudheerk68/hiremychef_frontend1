import { useState } from 'react'
import { Check, X } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import Tabs from '../../components/common/Tabs'
import Img from '../../components/common/Img'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { adminService } from '../../services/adminService'
import { inr } from '../../utils/format'

export default function AdminChefs() {
  const toast = useToast(); const [tab, setTab] = useState('Pending'); const [busy, setBusy] = useState(null)
  const { data, loading, error, reload } = useAsync(() => adminService.chefs(), [])
  const list = data || [], tabs = { Pending: list.filter((c) => !c.verified), Verified: list.filter((c) => c.verified), All: list }
  const set = async (c, value) => {
    setBusy(c.id)
    try { await adminService.setVerified(c.id, value); toast(value ? `${c.name} approved. They are now visible to customers.` : `${c.name} verification revoked`); reload() } catch (e) { toast(e.message, 'error') } finally { setBusy(null) }
  }
  return <>
    <DashHeader title="Chef approvals" text="Only verified chefs appear in search and can receive bookings." />
    <Tabs tabs={Object.keys(tabs)} value={tab} onChange={setTab} counts={{ Pending: tabs.Pending.length, Verified: tabs.Verified.length, All: list.length }} />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : tabs[tab].length === 0 ? <EmptyState icon="✅" title={tab === 'Pending' ? 'No chefs awaiting approval' : 'No chefs here'} text="You are all caught up." />
      : <div className="space-y-3">{tabs[tab].map((c) => <article key={c.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <Img src={c.photo} alt={c.name} className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg">{c.name}</h3><Badge tone={c.verified ? 'Completed' : 'Pending'}>{c.verified ? 'Verified' : 'Pending approval'}</Badge></div>
          <p className="text-sm text-ink-700">{c.city || 'City not set'} · {c.years} yrs · {inr(c.price)}/session</p>
          <p className="mt-1 text-sm text-ink-700">{c.cuisines.length ? c.cuisines.join(', ') : 'No cuisines listed'}{c.certifications?.length ? ` · ${c.certifications.join(', ')}` : ''}</p>
          {c.bio && <p className="mt-1 line-clamp-2 text-sm text-ink-700/80">{c.bio}</p>}</div>
        <div className="flex gap-2">{c.verified ? <Button variant="secondary" size="sm" loading={busy === c.id} onClick={() => set(c, false)}><X className="h-4 w-4" />Revoke</Button>
          : <Button size="sm" loading={busy === c.id} onClick={() => set(c, true)}><Check className="h-4 w-4" />Approve</Button>}</div></article>)}</div>}</>
}
