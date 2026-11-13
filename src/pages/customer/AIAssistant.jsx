import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Send, Loader2, ChefHat, ListChecks } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import Tabs from '../../components/common/Tabs'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Img from '../../components/common/Img'
import Badge from '../../components/common/Badge'
import { useToast } from '../../context/ToastContext'
import { aiService } from '../../services/aiService'
import { inr } from '../../utils/format'

const IDEAS = ['South Indian chef for 10 people in Nellore, budget ₹5000', 'Biryani for a birthday party, 25 guests in Hyderabad', 'Vegetarian family dinner in Vijayawada under ₹3000']
const HELLO = { from: 'ai', text: 'Hi! Describe your event in plain language: cuisine, city, number of guests and budget. I will rank the best chefs for you.' }

function Finder() {
  const toast = useToast(); const [msgs, setMsgs] = useState([HELLO]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs.length, busy])
  const ask = async (q) => {
    const message = (q ?? text).trim(); if (!message || busy) return
    setMsgs((m) => [...m, { from: 'me', text: message }]); setText(''); setBusy(true)
    try { const r = await aiService.chat(message); setMsgs((m) => [...m, { from: 'ai', text: r.reply, chefs: r.chefs }]) }
    catch (e) { toast(e.message, 'error'); setMsgs((m) => [...m, { from: 'ai', text: 'Sorry, I could not process that. Please try again.' }]) } finally { setBusy(false) }
  }
  return <div className="card flex flex-col">
    <div className="max-h-[32rem] min-h-[20rem] flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
      {msgs.map((m, i) => <div key={i} className={m.from === 'me' ? 'flex justify-end' : ''}><div className={`max-w-[92%] space-y-3 rounded-2xl px-4 py-3 text-sm ${m.from === 'me' ? 'bg-brand-600 text-white' : 'bg-cream-100'}`}>
        <p>{m.text}</p>
        {m.chefs?.map((c) => <Link key={c.id} to={`/chefs/${c.id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 text-ink-800 shadow-soft transition hover:shadow-lift">
          <Img src={c.photo} alt={c.name} className="h-14 w-14 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b className="truncate">{c.name}</b><Badge tone="Completed">{c.match}% match</Badge></div><p className="text-xs text-ink-700">{c.reason}</p><p className="mt-0.5 text-xs font-semibold">Est. {inr(c.estimate ?? c.price)} · ⭐ {c.rating}</p></div></Link>)}</div></div>)}
      {busy && <div className="flex items-center gap-2 text-sm text-ink-700"><Loader2 className="h-4 w-4 animate-spin" />Finding your best matches…</div>}<div ref={end} /></div>
    <div className="border-t border-cream-200 p-4">
      {msgs.length === 1 && <div className="mb-3 flex flex-wrap gap-2">{IDEAS.map((i) => <button key={i} onClick={() => ask(i)} className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium hover:border-brand-600">{i}</button>)}</div>}
      <form onSubmit={(e) => { e.preventDefault(); ask() }} className="flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} aria-label="Describe your event" placeholder="e.g. Italian dinner for 8 in Bengaluru, ₹6000" className="flex-1 rounded-xl border border-cream-200 px-3 py-2.5 text-sm" />
        <Button type="submit" loading={busy} disabled={!text.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button></form></div></div>
}

function Planner() {
  const toast = useToast(); const [f, setF] = useState({ cuisine: 'South Indian', guests: 10, diet: 'any', budget: '' }); const [out, setOut] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const go = async (e) => {
    e.preventDefault(); const g = Number(f.guests)
    if (!Number.isInteger(g) || g < 1 || g > 200) return setErr({ guests: 'Enter 1 to 200 guests' }); setErr({})
    setBusy(true)
    try { setOut(await aiService.menu({ cuisine: f.cuisine, guests: g, diet: f.diet, budget: Number(f.budget) || null })) } catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  return <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
    <form onSubmit={go} className="card h-fit space-y-4 p-5" noValidate>
      <Select label="Cuisine" value={f.cuisine} onChange={set('cuisine')}>{aiService.cuisines.map((c) => <option key={c}>{c}</option>)}</Select>
      <Input label="Guests" type="number" min="1" max="200" value={f.guests} error={err.guests} onChange={set('guests')} />
      <Select label="Diet" value={f.diet} onChange={set('diet')}><option value="any">No preference</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="jain">Jain</option></Select>
      <Input label="Budget in ₹ (optional)" type="number" min="0" value={f.budget} onChange={set('budget')} />
      <Button type="submit" loading={busy} className="w-full"><Sparkles className="h-4 w-4" />Plan my menu</Button></form>
    <div className="card p-6">{!out ? <div className="grid h-full place-items-center py-12 text-center text-ink-700"><div><ListChecks className="mx-auto h-9 w-9" /><p className="mt-2 text-sm">Your suggested menu will appear here.</p></div></div> : <>
      <h2 className="text-2xl">{out.title}</h2><p className="mt-1 text-sm text-ink-700">About <b className="text-ink-900">{inr(out.estimated_cost_per_head)}</b> per guest</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">{out.courses.map((c) => <div key={c.name} className="rounded-xl bg-cream-100 p-4"><p className="mb-2 font-display font-semibold text-ink-900">{c.name}</p><ul className="space-y-1 text-sm text-ink-700">{c.items.map((i) => <li key={i}>• {i}</li>)}</ul></div>)}</div>
      {out.tips?.length > 0 && <ul className="mt-5 space-y-1.5 text-sm text-ink-700">{out.tips.map((t) => <li key={t} className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{t}</li>)}</ul>}
      <Link to={`/chefs?cuisine=${encodeURIComponent(f.cuisine)}`} className="mt-6 inline-block"><Button variant="secondary"><ChefHat className="h-4 w-4" />Find {f.cuisine} chefs</Button></Link></>}</div></div>
}
export default function AIAssistant() {
  const [tab, setTab] = useState('Chef finder')
  return <><DashHeader title="AI assistant" text="Get matched with chefs and plan menus in plain language." />
    <Tabs tabs={['Chef finder', 'Menu planner']} value={tab} onChange={setTab} />{tab === 'Chef finder' ? <Finder /> : <Planner />}</>
}
