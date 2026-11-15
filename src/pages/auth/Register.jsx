import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, MapPin, Briefcase, UtensilsCrossed } from 'lucide-react'
import AuthCard from '../../components/common/AuthCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import GoogleSignIn from '../../components/common/GoogleSignIn'
import { useAuth, dashboardPath } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isEmail, validatePassword } from '../../utils/validators'
const init = { role:'customer', full_name:'', email:'', phone:'', password:'', confirm:'', city:'', cuisines:'', years_experience:'' }
export default function Register() {
  const { register, loginWithResult } = useAuth(); const nav = useNavigate(); const toast = useToast()
  const [f, setF] = useState(init); const [err, setErr] = useState({}); const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.full_name.trim().length < 2) er.full_name = 'Enter your full name'
    if (!isEmail(f.email)) er.email = 'Enter a valid email'
    const pe = validatePassword(f.password); if (pe) er.password = pe
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match'
    if (f.role === 'chef') { if (!f.city.trim()) er.city = 'Enter your city'; if (f.years_experience !== '' && (f.years_experience < 0 || f.years_experience > 60)) er.years_experience = '0 to 60' }
    setErr(er); if (Object.keys(er).length) return
    setBusy(true)
    const body = { role:f.role, full_name:f.full_name.trim(), email:f.email, password:f.password, phone:f.phone || null }
    if (f.role === 'chef') Object.assign(body, { city:f.city.trim(), cuisines:f.cuisines.split(',').map((c) => c.trim()).filter(Boolean), years_experience:Number(f.years_experience) || 0 })
    try { const u = await register(body); toast('Account created. Welcome!'); nav(dashboardPath(u.role)) }
    catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  const googleSession = async (result) => {
    const u = await loginWithResult(result)
    toast(result.is_new ? 'Account created. Welcome!' : `Welcome back, ${u.name}!`)
    nav(dashboardPath(u.role))
  }
  return <AuthCard wide title="Create your account" text="Join as a customer to book chefs, or as a chef to grow your business.">
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-2">{[['customer','I want to hire a chef'],['chef','I am a chef']].map(([r, l]) =>
        <button type="button" role="radio" aria-checked={f.role === r} key={r} onClick={() => setF({ ...f, role:r })} className={`rounded-xl border px-3 py-3 text-sm font-medium ${f.role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-cream-200'}`}>{l}</button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" icon={User} value={f.full_name} error={err.full_name} onChange={set('full_name')} />
        <Input label="Phone (optional)" icon={Phone} value={f.phone} onChange={set('phone')} />
        <Input label="Email" type="email" icon={Mail} className="sm:col-span-2" value={f.email} error={err.email} onChange={set('email')} />
        <Input label="Password" type="password" icon={Lock} value={f.password} error={err.password} onChange={set('password')} />
        <Input label="Confirm password" type="password" icon={Lock} value={f.confirm} error={err.confirm} onChange={set('confirm')} />
        {f.role === 'chef' && <>
          <Input label="City" icon={MapPin} value={f.city} error={err.city} onChange={set('city')} />
          <Input label="Years of experience" type="number" icon={Briefcase} value={f.years_experience} error={err.years_experience} onChange={set('years_experience')} />
          <Input label="Cuisines (comma separated)" icon={UtensilsCrossed} className="sm:col-span-2" placeholder="South Indian, Biryani" value={f.cuisines} onChange={set('cuisines')} />
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 sm:col-span-2">Chef accounts are reviewed by our team before your profile is listed publicly.</p></>}
      </div>
      <Button type="submit" loading={busy} className="w-full">Create account</Button>
      <GoogleSignIn onSession={googleSession} />
      <p className="text-center text-sm text-ink-700">Already registered? <Link to="/login" className="font-semibold text-brand-600">Log in</Link></p>
    </form></AuthCard>
}
