import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, MessageSquare, ArrowLeft } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import useAsync from '../../hooks/useAsync'
import useIdentity from '../../hooks/useIdentity'
import { useToast } from '../../context/ToastContext'
import { messagesService } from '../../services/messagesService'
import { chefsService } from '../../services/chefsService'
import { timeAgo, initials, fmtTime } from '../../utils/format'

/** Shared by customer and chef. Customers can open a new thread with ?chef=<id>. */
export default function Messages() {
  const me = useIdentity(); const toast = useToast(); const [sp] = useSearchParams()
  const { data, loading, error, reload } = useAsync(() => messagesService.threads(me), [me.userId, me.chefId])
  const [active, setActive] = useState(undefined); // undefined = not chosen yet, null = list view (mobile back)
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [draftChef, setDraftChef] = useState(null)
  const end = useRef(null)
  const chefParam = me.role === 'customer' ? Number(sp.get('chef')) || null : null

  useEffect(() => { if (chefParam) chefsService.get(chefParam).then(setDraftChef).catch(() => {}) }, [chefParam])
  const threads = data || []
  const draft = draftChef && !threads.some((t) => t.chef_id === draftChef.id) ? { id: 'new', customer_id: me.userId, chef_id: draftChef.id, name: draftChef.name, messages: [], last: '', at: null } : null
  const all = draft ? [draft, ...threads] : threads
  const preferred = () => (chefParam ? all.find((t) => t.chef_id === chefParam)?.id ?? all[0]?.id : all[0]?.id)
  // Pick a thread initially, and re-pick if the selected one vanished (e.g. a draft replaced by the real thread).
  useEffect(() => { if (all.length && (active === undefined || (active !== null && !all.some((t) => t.id === active)))) setActive(preferred()) }, [all.map((t) => t.id).join('|'), active, chefParam]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = all.find((t) => t.id === active)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [cur?.messages.length, active])

  const send = async (e) => {
    e.preventDefault(); const content = text.trim(); if (!content || !cur) return
    setBusy(true)
    try {
      await messagesService.send({ content, to: { customer_id: cur.customer_id, chef_id: cur.chef_id, customer_name: me.role === 'customer' ? me.name : cur.name, chef_name: me.role === 'customer' ? cur.name : me.name } }, me)
      setText(''); await reload(); if (cur.id === 'new') setActive(`${cur.customer_id}-${cur.chef_id}`)
    } catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  return <>
    <DashHeader title="Messages" text={me.role === 'chef' ? 'Talk to customers about their events.' : 'Chat with chefs before and after you book.'} />
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-96" />
      : all.length === 0 ? <EmptyState icon="💬" title="No conversations yet" text={me.role === 'chef' ? 'Messages from customers will appear here.' : 'Open a chef’s profile and tap “Message chef” to start a conversation.'} />
      : <div className="card grid min-h-[28rem] overflow-hidden md:grid-cols-[280px_1fr]">
        <ul className={`max-h-[34rem] overflow-y-auto border-cream-200 md:border-r ${cur ? 'hidden md:block' : ''}`}>{all.map((t) => <li key={t.id}><button onClick={() => setActive(t.id)} className={`flex w-full items-center gap-3 border-b border-cream-200 px-4 py-3 text-left hover:bg-cream-100 ${t.id === active ? 'bg-brand-50' : ''}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initials(t.name)}</span>
          <span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><b className="truncate text-sm">{t.name}</b>{t.at && <span className="text-xs text-ink-700">{timeAgo(t.at)}</span>}</span><span className="block truncate text-xs text-ink-700">{t.last || 'New conversation'}</span></span></button></li>)}</ul>
        {cur ? <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-cream-200 px-4 py-3"><button className="md:hidden" aria-label="Back" onClick={() => setActive(null)}><ArrowLeft className="h-5 w-5" /></button><b>{cur.name}</b></div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-cream-100/60 p-4" style={{ maxHeight: '26rem' }} aria-live="polite">
            {cur.messages.length === 0 && <p className="pt-10 text-center text-sm text-ink-700">Say hello to {cur.name} 👋</p>}
            {cur.messages.map((m) => <div key={m.id} className={`flex ${m.mine ? 'justify-end' : ''}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.mine ? 'bg-brand-600 text-white' : 'bg-white shadow-soft'}`}><p className="whitespace-pre-wrap break-words">{m.content}</p><p className={`mt-1 text-[10px] ${m.mine ? 'text-white/70' : 'text-ink-700/60'}`}>{fmtTime(m.at)}</p></div></div>)}<div ref={end} /></div>
          <form onSubmit={send} className="flex gap-2 border-t border-cream-200 p-3"><input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Type a message…" aria-label="Message" className="flex-1 rounded-xl border border-cream-200 px-3 py-2 text-sm" />
            <Button type="submit" loading={busy} disabled={!text.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button></form></div>
          : <div className="hidden place-items-center md:grid"><div className="text-center text-ink-700"><MessageSquare className="mx-auto h-8 w-8" /><p className="mt-2 text-sm">Select a conversation</p></div></div>}</div>}</>
}
