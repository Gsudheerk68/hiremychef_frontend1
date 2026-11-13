import { useState } from 'react'
import DashHeader from '../../components/common/DashHeader'
import Calendar from '../../components/common/Calendar'
import Button from '../../components/common/Button'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import useAsync from '../../hooks/useAsync'
import { useDash } from '../../layouts/DashboardLayout'
import { useToast } from '../../context/ToastContext'
import { chefsService } from '../../services/chefsService'

export default function Availability() {
  const { chef } = useDash(); const toast = useToast()
  const { data, loading, error, reload } = useAsync(() => chefsService.availability(chef.id), [chef.id])
  const [sel, setSel] = useState([]); const [busy, setBusy] = useState(false)
  const blocked = data?.blocked || [], toBlock = sel.filter((d) => !blocked.includes(d)), toUnblock = sel.filter((d) => blocked.includes(d))
  const toggle = (d) => setSel((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
  const apply = async (kind) => {
    setBusy(true)
    try {
      if (kind === 'block') await chefsService.block(toBlock); else await chefsService.unblock(toUnblock)
      toast(kind === 'block' ? `${toBlock.length} day(s) blocked` : `${toUnblock.length} day(s) opened`); setSel([]); reload()
    } catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  return <>
    <DashHeader title="Availability" text="You are available every day unless you block it. Days with an accepted booking are blocked automatically." />
    {error ? <ErrorState message={error} onRetry={reload} /> : !data && loading ? <Skeleton className="h-80" /> : <div className="card p-6">
      <Calendar months={2} blocked={blocked} booked={data?.booked || []} selected={sel} onToggle={toggle} />
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-200 pt-5">
        <Button disabled={!toBlock.length} loading={busy} onClick={() => apply('block')}>Block {toBlock.length || ''} selected</Button>
        <Button variant="secondary" disabled={!toUnblock.length} loading={busy} onClick={() => apply('unblock')}>Open {toUnblock.length || ''} selected</Button>
        {sel.length > 0 && <Button variant="ghost" onClick={() => setSel([])}>Clear selection</Button>}
        <p className="text-xs text-ink-700">Select up to 60 days at a time. Booked days cannot be changed here.</p></div></div>}</>
}
