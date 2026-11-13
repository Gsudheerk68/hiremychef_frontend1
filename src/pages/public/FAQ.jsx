import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
const faqs = [
  ['How do I book a chef?','Search for a chef, open their profile, pick a date and share your event details. The chef then accepts or declines your request.'],
  ['How is the price calculated?','Each chef sets a rate per session. You see an estimate before confirming, based on guests and event type.'],
  ['Are chefs verified?','Yes. Every chef profile is reviewed and approved by our team before it appears in search.'],
  ['Who buys the groceries?','You and the chef agree on this in the booking details and chat. Many chefs shop for you and add the cost to the estimate.'],
  ['Can I cancel a booking?','Yes. You can cancel from your bookings page. Cancelling early is fairer to the chef and keeps your rating healthy.'],
  ['What does the AI assistant do?','It understands requests like “South Indian dinner for 10 under ₹5,000”, suggests chefs with reasons, and helps plan menus. It always asks you to confirm before anything is booked.'],
  ['How do I become a chef on the platform?','Register as a chef, complete your profile and wait for approval. Approved chefs can set their own rates and availability.'],
  ['I forgot my password. What now?','Use “Forgot password” on the login page and follow the link we send to your email.'],
]
export default function FAQ() {
  const [open, setOpen] = useState(0)
  return <><PageHeader kicker="FAQ" title="Frequently asked questions" />
    <section className="section pt-4"><div className="container-x max-w-3xl space-y-3">{faqs.map(([q, a], i) => <div key={q} className="card overflow-hidden">
      <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"><span>{q}</span><ChevronDown className={`h-5 w-5 shrink-0 transition ${open === i ? 'rotate-180' : ''}`} /></button>
      {open === i && <p className="px-5 pb-5 text-sm text-ink-700">{a}</p>}</div>)}</div></section></>
}
