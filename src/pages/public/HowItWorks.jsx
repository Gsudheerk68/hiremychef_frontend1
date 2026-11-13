import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
const flows = {
  customer: [['Search and filter','Browse chefs by cuisine, location, budget, rating and availability.'],['Compare profiles','Check portfolios, certifications, reviews and live calendars.'],['Request a booking','Share date, guests, menu preferences and location, and see an estimate.'],['Chef confirms','The chef accepts your request. Chat to finalise the details.'],['Enjoy and review','Your chef cooks at your home. Rate the experience afterwards.']],
  chef: [['Create your profile','Add your bio, cuisines, certifications, photos and rates.'],['Get verified','Our team reviews your profile before it goes live.'],['Receive requests','Accept or decline bookings that fit your calendar.'],['Cook and get paid','Deliver a great meal and track your earnings.'],['Grow with insights','Use reviews and our AI business assistant to improve.']],
}
export default function HowItWorks() {
  const [tab, setTab] = useState('customer')
  return <>
    <PageHeader kicker="How it works" title="Simple for customers, rewarding for chefs" />
    <section className="section pt-4"><div className="container-x max-w-3xl">
      <div role="tablist" className="mx-auto mb-10 grid max-w-sm grid-cols-2 rounded-xl bg-cream-200 p-1">{[['customer','For customers'],['chef','For chefs']].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-lg py-2 text-sm font-semibold ${tab === k ? 'bg-white shadow-soft' : 'text-ink-700'}`}>{l}</button>)}</div>
      <ol className="space-y-4">{flows[tab].map(([t, d], i) => <li key={t} className="card flex gap-4 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span><div><h3 className="text-lg">{t}</h3><p className="text-sm text-ink-700">{d}</p></div></li>)}</ol>
      <div className="mt-10 text-center"><Link to="/register"><Button size="lg">{tab === 'customer' ? 'Create a free account' : 'Join as a chef'}</Button></Link></div></div></section></>
}
