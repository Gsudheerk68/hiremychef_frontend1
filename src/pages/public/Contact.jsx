import { useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useToast } from '../../context/ToastContext'
import { isEmail } from '../../utils/validators'
export default function Contact() {
  const toast = useToast(); const [f, setF] = useState({ name:'', email:'', subject:'', message:'' }); const [err, setErr] = useState({}); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault(); const er = {}
    if (f.name.trim().length < 2) er.name = 'Enter your name'; if (!isEmail(f.email)) er.email = 'Enter a valid email'; if (f.message.trim().length < 10) er.message = 'Please write at least 10 characters'
    setErr(er); if (Object.keys(er).length) return
    setBusy(true) // No backend endpoint yet: simulated send
    setTimeout(() => { setBusy(false); setF({ name:'', email:'', subject:'', message:'' }); toast('Message sent. We’ll reply within 24 hours.') }, 700)
  }
  return <><PageHeader kicker="Contact us" title="We’d love to hear from you" />
    <section className="section pt-4"><div className="container-x grid gap-8 lg:grid-cols-3">
      <div className="space-y-4">{[[Mail,'Email','support@hiremychef.in'],[Phone,'Phone','+91 98765 43210'],[MapPin,'Office','Nellore, Andhra Pradesh']].map(([I, t, v]) => <div key={t} className="card flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><I className="h-5 w-5" /></div><div><p className="text-sm text-ink-700">{t}</p><p className="font-semibold">{v}</p></div></div>)}</div>
      <form onSubmit={submit} noValidate className="card space-y-4 p-6 lg:col-span-2"><div className="grid gap-4 sm:grid-cols-2"><Input label="Name" value={f.name} error={err.name} onChange={set('name')} /><Input label="Email" type="email" value={f.email} error={err.email} onChange={set('email')} /></div>
        <Input label="Subject" value={f.subject} onChange={set('subject')} />
        <div><label htmlFor="msg" className="label">Message</label><textarea id="msg" rows={5} value={f.message} onChange={set('message')} className={`w-full rounded-xl border bg-white p-3 text-sm ${err.message ? 'border-red-500' : 'border-cream-200'}`} />{err.message && <p className="mt-1 text-xs text-red-600">{err.message}</p>}</div>
        <Button type="submit" loading={busy}>Send message</Button></form></div></section></>
}
