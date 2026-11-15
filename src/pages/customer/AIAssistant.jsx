import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Send, Loader2, ChefHat, ListChecks, RotateCcw, Check, X, CalendarDays, MapPin, Users } from 'lucide-react'
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
const HELLO = { from: 'ai', text: 'Hi! Describe your event in plain language: cuisine, city, number of guests and budget. I will find the best chefs, and I can send a booking request for you once you confirm.' }

function ConfirmCard({ p, busy, onAnswer }) {
  return <div className="max-w-[92%] space-y-3 rounded-2xl border border-brand-600 bg-white px-4 py-4 text-sm shadow-soft" role="group" aria-label="Confirm booking">
    <p className="font-display font-semibold text-ink-900">Please confirm this booking request</p>
    <ul className="space-y-1.5 text-ink-700">
      <li className="flex items-center gap-2"><ChefHat className="h-4 w-4 shrink-0 text-brand-600" /><b className="text-ink-900">{p.chef_name}</b> · {p.event_type}</li>
      <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-brand-600" />{p.when}</li>
      <li className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-brand-600" />{p.guests} guests</li>
      <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-600" />{p.location}</li>
    </ul>
    <p className="font-semibold text-ink-900">Estimated price: {inr(p.estimated_price)}</p>
    <p className="text-xs text-ink-700">This sends a request. It stays pending until the chef accepts it.</p>
    <div className="flex gap-2">
      <Button loading={busy} onClick={() => onAnswer(true)}><Check className="h-4 w-4" />Confirm booking</Button>
      <Button variant="secondary" disabled={busy} onClick={() => onAnswer(false)}><X className="h-4 w-4" />Cancel</Button>
    </div></div>
}

function ChefResult({ c }) {
  return <div className="flex items-start gap-3 rounded-xl bg-white p-3 text-ink-800 shadow-soft">
    <Link to={`/chefs/${c.id}`} className="shrink-0"><Img src={c.photo} alt={c.name} className="h-14 w-14 rounded-lg" /></Link>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <Link to={`/chefs/${c.id}`} className="truncate font-bold hover:text-brand-600">{c.name}</Link>
        <Badge tone="Completed">{c.match}% match</Badge></div>
      <p className="text-xs text-ink-700">{c.reason}</p>
      <p className="mt-0.5 flex items-center justify-between text-xs font-semibold">
        <span>Est. {inr(c.estimate ?? c.price)} · ⭐ {c.rating}</span>
        <Link to={`/customer/book/${c.id}`} className="text-brand-600 hover:underline">Book →</Link></p>
      {c.factors?.length > 0 && <details className="mt-2 text-xs">
        <summary className="cursor-pointer font-medium text-brand-600">Why this rank?</summary>
        <ul className="mt-1.5 space-y-1">{c.factors.map((f) => <li key={f.label} className="flex items-center gap-2">
          <span className={`w-4 text-center font-bold ${f.direction === 'up' ? 'text-green-600' : 'text-red-500'}`} aria-label={f.direction === 'up' ? 'raised the score' : 'lowered the score'}>{f.direction === 'up' ? '+' : '−'}</span>
          <span className="flex-1">{f.label}</span>
          <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-cream-200"><span className={`block h-full ${f.direction === 'up' ? 'bg-green-600' : 'bg-red-500'}`} style={{ width: `${f.weight}%` }} /></span></li>)}</ul>
        <p className="mt-1.5 text-[11px] text-ink-700/70">How each factor moved this chef's score compared with an average chef, according to the ML model.</p></details>}
    </div></div>
}

function Finder() {
  const toast = useToast(); const [msgs, setMsgs] = useState([HELLO]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [pending, setPending] = useState(null); const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs.length, busy, pending])
  const handle = (r) => { setMsgs((m) => [...m, { from: 'ai', text: r.reply, chefs: r.chefs, rankedBy: r.rankedBy }]); setPending(r.pending || null) }
  const fail = (e) => { toast(e.message, 'error'); setMsgs((m) => [...m, { from: 'ai', text: 'Sorry, I could not process that. Please try again.' }]) }
  const ask = async (q) => {
    const message = (q ?? text).trim(); if (!message || busy || pending) return
    setMsgs((m) => [...m, { from: 'me', text: message }]); setText(''); setBusy(true)
    try { handle(await aiService.chat(message)) } catch (e) { fail(e) } finally { setBusy(false) }
  }
  const answer = async (yes) => {
    if (busy) return
    setMsgs((m) => [...m, { from: 'me', text: yes ? 'Yes, confirm the booking.' : 'Cancel.' }]); setBusy(true)
    try { handle(await aiService.confirm(yes)) } catch (e) { fail(e) } finally { setBusy(false) }
  }
  const restart = () => { if (busy) return; aiService.reset(); setMsgs([HELLO]); setPending(null); setText('') }
  return <div className="card flex flex-col">
    <div className="flex items-center justify-end border-b border-cream-200 px-4 py-2">
      <button onClick={restart} disabled={busy} className="flex items-center gap-1.5 text-xs font-medium text-ink-700 hover:text-brand-600 disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" />New chat</button></div>
    <div className="max-h-[32rem] min-h-[20rem] flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
      {msgs.map((m, i) => <div key={i} className={m.from === 'me' ? 'flex justify-end' : ''}><div className={`max-w-[92%] space-y-3 rounded-2xl px-4 py-3 text-sm ${m.from === 'me' ? 'bg-brand-600 text-white' : 'bg-cream-100'}`}>
        <p className="whitespace-pre-line">{m.text}</p>
        {m.chefs?.length > 0 && <p className="flex items-center gap-1.5 text-xs font-medium text-ink-700"><Sparkles className="h-3.5 w-3.5 text-brand-600" />{m.rankedBy === 'ml' ? 'Ranked by our machine-learning model (LightGBM)' : 'Ranked by our scoring rules'}</p>}
        {m.chefs?.map((c) => <ChefResult key={c.id} c={c} />)}</div></div>)}
      {pending && <ConfirmCard p={pending} busy={busy} onAnswer={answer} />}
      {busy && <div className="flex items-center gap-2 text-sm text-ink-700"><Loader2 className="h-4 w-4 animate-spin" />Thinking… this can take up to a minute.</div>}<div ref={end} /></div>
    <div className="border-t border-cream-200 p-4">
      {msgs.length === 1 && <div className="mb-3 flex flex-wrap gap-2">{IDEAS.map((i) => <button key={i} onClick={() => ask(i)} className="rounded-full border border-cream-200 bg-white px-3 py-1.5 text-xs font-medium hover:border-brand-600">{i}</button>)}</div>}
      <form onSubmit={(e) => { e.preventDefault(); ask() }} className="flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} disabled={!!pending} aria-label="Describe your event" placeholder={pending ? 'Please confirm or cancel the booking above' : 'e.g. Italian dinner for 8 in Bengaluru, ₹6000'} className="flex-1 rounded-xl border border-cream-200 px-3 py-2.5 text-sm disabled:bg-cream-100" />
        <Button type="submit" loading={busy && !pending} disabled={!text.trim() || !!pending} aria-label="Send"><Send className="h-4 w-4" /></Button></form></div></div>
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
