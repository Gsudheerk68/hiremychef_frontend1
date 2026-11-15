import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { MapPin, Briefcase, UtensilsCrossed } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { isMock } from '../../api/client'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function GoogleSignIn({ onSession }) {
  const toast = useToast()
  const [cred, setCred] = useState(null)          // the Google credential, kept in memory only
  const [who, setWho] = useState(null)            // { email, name } shown on the role step
  const [role, setRole] = useState('customer')
  const [chef, setChef] = useState({ city: '', cuisines: '', years: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  if (!GOOGLE_ENABLED || isMock('auth')) return null  // no client id, or running on mock data

  const reset = () => { setCred(null); setWho(null); setErr({}) }

  const send = async (body) => {
    setBusy(true)
    try {
      const r = await authService.google(body)
      if (r.needs_role) { setCred(body.credential); setWho({ email: r.email, name: r.name }) }
      else { await onSession(r); reset() }
    } catch (x) {
      toast(x.message, 'error')
      if (x.status === 401) reset()                // credential expired or invalid: start over
    } finally { setBusy(false) }
  }

  const onGoogle = (resp) => { if (resp?.credential) send({ credential: resp.credential }) }

  const confirmRole = () => {
    const er = {}
    if (role === 'chef') {
      if (!chef.city.trim()) er.city = 'Enter your city'
      if (chef.years !== '' && (chef.years < 0 || chef.years > 60)) er.years = '0 to 60'
    }
    setErr(er); if (Object.keys(er).length) return
    const body = { credential: cred, role }
    if (role === 'chef') Object.assign(body, {
      city: chef.city.trim(), years_experience: Number(chef.years) || 0,
      cuisines: chef.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
    })
    send(body)
  }

  if (who) return <div className="space-y-4 rounded-xl border border-cream-200 p-4">
    <p className="text-sm">Continue as <b>{who.name}</b> ({who.email}). How will you use Hire My Chef?</p>
    <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-2">
      {[['customer', 'I want to hire a chef'], ['chef', 'I am a chef']].map(([r, l]) =>
        <button type="button" role="radio" aria-checked={role === r} key={r} onClick={() => setRole(r)}
          className={`rounded-xl border px-3 py-3 text-sm font-medium ${role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-cream-200'}`}>{l}</button>)}
    </div>
    {role === 'chef' && <div className="space-y-3">
      <Input label="City" icon={MapPin} value={chef.city} error={err.city} onChange={(e) => setChef({ ...chef, city: e.target.value })} />
      <Input label="Years of experience" type="number" icon={Briefcase} value={chef.years} error={err.years} onChange={(e) => setChef({ ...chef, years: e.target.value })} />
      <Input label="Cuisines (comma separated)" icon={UtensilsCrossed} placeholder="South Indian, Biryani" value={chef.cuisines} onChange={(e) => setChef({ ...chef, cuisines: e.target.value })} />
      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Chef accounts are reviewed by our team before your profile is listed publicly.</p></div>}
    <div className="flex gap-2">
      <Button loading={busy} onClick={confirmRole} className="flex-1">Continue</Button>
      <Button variant="secondary" disabled={busy} onClick={reset}>Cancel</Button></div>
  </div>

  return <div className="space-y-3">
    <div className="flex items-center gap-3 text-xs text-ink-700"><span className="h-px flex-1 bg-cream-200" />or<span className="h-px flex-1 bg-cream-200" /></div>
    <div className="flex justify-center"><GoogleLogin onSuccess={onGoogle} onError={() => toast('Google sign-in failed. Please try again.', 'error')} text="continue_with" shape="pill" width="320" /></div>
  </div>
}
