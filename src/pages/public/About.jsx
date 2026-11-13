import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, Sparkles, Users } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
const values = [
  { i: Heart, t:'Food made with care', d:'We celebrate home-style cooking and the chefs behind it.' },
  { i: ShieldCheck, t:'Trust and hygiene', d:'Verified chefs, clear pricing and honest reviews on every booking.' },
  { i: Sparkles, t:'Smart by design', d:'AI recommendations and menu planning save you time and guesswork.' },
  { i: Users, t:'Fair for chefs', d:'Chefs set their own rates and keep control of their calendar.' },
]
export default function About() {
  return <>
    <PageHeader kicker="About us" title="Bringing great chefs to every table" text="Hire My Chef connects busy people with skilled professional chefs for everyday meals, parties and big events." />
    <section className="section"><div className="container-x grid gap-10 lg:grid-cols-2">
      <div className="space-y-4 text-ink-700"><h2 className="text-3xl text-ink-900">Why we exist</h2>
        <p>Many of us lack the time or cooking skills to prepare a proper meal for guests, and restaurants can be costly and less hygienic for large gatherings. Finding a trustworthy chef for an event, especially during peak season, is even harder.</p>
        <p>Hire My Chef is a marketplace where customers discover, compare and book verified chefs by cuisine, location, budget and availability, while chefs get a professional space to showcase their skills and manage bookings.</p></div>
      <div className="grid grid-cols-3 gap-4 text-center">{[['500+','Verified chefs'],['12k','Events served'],['4.8★','Average rating']].map(([n, l]) => <div key={l} className="card p-5"><p className="font-display text-3xl font-bold text-brand-600">{n}</p><p className="text-sm text-ink-700">{l}</p></div>)}</div></div></section>
    <section className="section bg-white"><div className="container-x"><h2 className="mb-8 text-center text-3xl">What we stand for</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ i: I, t, d }) => <div key={t} className="rounded-2xl bg-cream-100 p-6"><I className="h-7 w-7 text-brand-600" /><h3 className="mt-3 text-lg">{t}</h3><p className="mt-1 text-sm text-ink-700">{d}</p></div>)}</div></div></section>
    <section className="section text-center"><h2 className="text-3xl">Ready to get started?</h2><div className="mt-6 flex justify-center gap-3"><Link to="/chefs"><Button>Find a chef</Button></Link><Link to="/register"><Button variant="secondary">Join as a chef</Button></Link></div></section></>
}
