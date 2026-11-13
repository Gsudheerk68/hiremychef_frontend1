import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, CalendarCheck, BadgeCheck, Wallet, ShieldCheck, Lock, MapPin, UtensilsCrossed, CalendarDays, Search, Sparkles, Star } from 'lucide-react'
import Button from '../../components/common/Button'
import ChefCard from '../../components/common/ChefCard'
import Skeleton from '../../components/common/Skeleton'
import Img from '../../components/common/Img'
import { chefsService } from '../../services/chefsService'
import { cuisines } from '../../data/chefs'
import { steps, perks, testimonials } from '../../data/content'
const Icons = { Search, Scale, CalendarCheck, UtensilsCrossed, BadgeCheck, Wallet, ShieldCheck, Lock }
const fade = { initial:{ opacity:0, y:16 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true }, transition:{ duration:.5 } }
const Head = ({ kicker, title, text }) => <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{kicker}</p><h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>{text && <p className="mt-3 text-ink-700">{text}</p>}</div>
export default function Landing() {
  const nav = useNavigate()
  const [s, setS] = useState({ city:'', cuisine:'', event:'', date:'' })
  const [rec, setRec] = useState(null)
  useEffect(() => { chefsService.recommended().then(setRec) }, [])
  const search = (e) => { e.preventDefault(); nav('/chefs?' + new URLSearchParams(Object.entries(s).filter(([, v]) => v))) }
  const fld = 'w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm'
  return <>
    <section className="bg-gradient-to-b from-brand-50 to-cream-100"><div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
      <motion.div {...fade}><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-soft"><Sparkles className="h-3.5 w-3.5" />AI-powered chef matching</span>
        <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl">A Professional Chef, <span className="text-brand-600">Right at Your Doorstep.</span></h1>
        <p className="mt-5 max-w-xl text-lg text-ink-700">Hire verified private chefs for family dinners, parties and special events. Compare, chat with our AI assistant and book in minutes.</p>
        <form onSubmit={search} className="card mt-8 grid gap-3 p-4 sm:grid-cols-2" aria-label="Search chefs">
          <label className="relative"><span className="sr-only">Location</span><MapPin className="absolute left-3 top-3 h-4 w-4 text-ink-700/60" /><input className={fld + ' pl-9'} placeholder="Location" value={s.city} onChange={(e) => setS({ ...s, city:e.target.value })} /></label>
          <label className="relative"><span className="sr-only">Cuisine</span><UtensilsCrossed className="absolute left-3 top-3 h-4 w-4 text-ink-700/60" /><select className={fld + ' pl-9'} value={s.cuisine} onChange={(e) => setS({ ...s, cuisine:e.target.value })}><option value="">Any cuisine</option>{cuisines.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
          <label><span className="sr-only">Event type</span><select className={fld} value={s.event} onChange={(e) => setS({ ...s, event:e.target.value })}><option value="">Any event</option><option>Family dinner</option><option>Birthday party</option><option>Wedding</option><option>Corporate</option></select></label>
          <label className="relative"><span className="sr-only">Date</span><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-ink-700/60" /><input type="date" className={fld + ' pl-9'} value={s.date} onChange={(e) => setS({ ...s, date:e.target.value })} /></label>
          <Button type="submit" size="lg" className="sm:col-span-2"><Search className="h-4 w-4" />Find chefs</Button></form>
      </motion.div>
      <motion.div {...fade} className="relative"><Img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=70" alt="Chef cooking in a home kitchen" className="aspect-[4/3] w-full rounded-3xl shadow-lift" />
        <div className="card absolute -bottom-5 left-4 flex items-center gap-3 px-4 py-3"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><div><p className="text-sm font-bold">4.8 average rating</p><p className="text-xs text-ink-700">12,000+ events served</p></div></div></motion.div>
    </div></section>

    <section className="section"><div className="container-x"><Head kicker="Featured" title="Chefs our customers love" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{rec ? rec.map((c) => <ChefCard key={c.id} chef={c} />) : [1,2,3,4].map((i) => <Skeleton key={i} className="h-80" />)}</div>
      <div className="mt-8 text-center"><Link to="/chefs"><Button variant="secondary">Browse all chefs</Button></Link></div></div></section>

    <section className="section bg-white"><div className="container-x"><Head kicker="Cuisines" title="Whatever you’re craving" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{cuisines.map((c) => <Link key={c.name} to={'/chefs?cuisine=' + encodeURIComponent(c.name)} className="card p-5 text-center transition hover:-translate-y-1 hover:shadow-lift"><div className="text-4xl">{c.emoji}</div><p className="mt-2 font-semibold">{c.name}</p><p className="text-xs text-ink-700">{c.count} chefs</p></Link>)}</div></div></section>

    <section className="section"><div className="container-x"><Head kicker="How it works" title="From craving to table in four steps" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map((x, i) => { const I = Icons[x.i]; return <motion.div key={x.t} {...fade} className="card p-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><I /></div><p className="mt-4 text-xs font-bold text-brand-600">STEP {i + 1}</p><h3 className="text-xl">{x.t}</h3><p className="mt-1 text-sm text-ink-700">{x.d}</p></motion.div> })}</div></div></section>

    <section className="section bg-white"><div className="container-x"><Head kicker="Why us" title="Why choose Hire My Chef" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{perks.map((x) => { const I = Icons[x.i]; return <div key={x.t} className="rounded-2xl bg-cream-100 p-6"><I className="h-7 w-7 text-brand-600" /><h3 className="mt-3 text-lg">{x.t}</h3><p className="mt-1 text-sm text-ink-700">{x.d}</p></div> })}</div></div></section>

    <section className="section"><div className="container-x"><div className="grid items-center gap-8 rounded-3xl bg-ink-900 p-8 text-white lg:grid-cols-2 lg:p-12">
      <div><p className="flex items-center gap-2 text-sm font-semibold text-brand-300"><Sparkles className="h-4 w-4" />AI recommendations</p><h2 className="mt-2 text-3xl !text-white">Describe your event. We’ll find your chef.</h2>
        <p className="mt-3 text-cream-200/80">Our assistant understands requests in plain language, then ranks chefs by cuisine, budget, location, ratings and availability, with reasons.</p>
        <Link to="/register"><Button className="mt-6">Try the AI assistant</Button></Link></div>
      <div className="space-y-3 rounded-2xl bg-white/10 p-5 text-sm"><p className="ml-auto max-w-[85%] rounded-2xl bg-brand-600 p-3">South Indian chef for 10 people in Nellore this Sunday, budget ₹5,000.</p>
        <div className="max-w-[90%] rounded-2xl bg-white/15 p-3"><p className="font-semibold">Top match: Ravi Kumar · 96%</p><p className="mt-1 text-cream-200/80">Andhra specialist, available Sunday, estimated ₹4,200 for 10 guests.</p></div></div></div></div></section>

    <section className="section pt-0"><div className="container-x"><Head kicker="Testimonials" title="Loved by hosts across Andhra Pradesh" />
      <div className="grid gap-5 md:grid-cols-3">{testimonials.map((t) => <figure key={t.n} className="card p-6"><div className="flex">{[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div><blockquote className="mt-3 text-ink-700">“{t.q}”</blockquote><figcaption className="mt-4 text-sm"><b>{t.n}</b><br /><span className="text-ink-700">{t.r}</span></figcaption></figure>)}</div></div></section>

    <section className="pb-20"><div className="container-x"><div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-14 text-center text-white"><h2 className="text-3xl !text-white sm:text-4xl">Ready for your next great meal?</h2><p className="mx-auto mt-3 max-w-lg text-white/90">Book a professional chef today, or join as a chef and grow your business.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/chefs"><Button variant="dark" size="lg">Find a chef</Button></Link><Link to="/register"><Button variant="secondary" size="lg">Become a chef</Button></Link></div></div></div></section>
  </>
}
