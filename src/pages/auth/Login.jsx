import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth, dashboardPath } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
export default function Login() {
  const { login } = useAuth(); const nav = useNavigate(); const toast = useToast(); const loc = useLocation()
  const [f, setF] = useState({ email:'', password:'', role:'customer' }); const [err, setErr] = useState({}); const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    const er = {}; if (!/\S+@\S+\.\S+/.test(f.email)) er.email = 'Enter a valid email'; if (f.password.length < 6) er.password = 'Minimum 6 characters'
    setErr(er); if (Object.keys(er).length) return
    setBusy(true)
    try { const u = await login(f); toast(`Welcome back, ${u.name}!`); nav(loc.state?.from?.pathname || dashboardPath(u.role)) }
    catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  return <div className="container-x section grid place-items-center"><form onSubmit={submit} className="card w-full max-w-md space-y-4 p-8" noValidate>
    <h1 className="text-3xl">Welcome back</h1><p className="text-sm text-ink-700">Log in to manage your bookings.</p>
    <div><span className="label">Log in as</span><div className="grid grid-cols-3 gap-2">{['customer','chef','admin'].map((r) => <button type="button" key={r} onClick={() => setF({ ...f, role:r })} className={`rounded-xl border py-2 text-sm font-medium capitalize ${f.role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-cream-200'}`}>{r}</button>)}</div></div>
    <Input label="Email" type="email" icon={Mail} value={f.email} error={err.email} onChange={(e) => setF({ ...f, email:e.target.value })} />
    <Input label="Password" type="password" icon={Lock} value={f.password} error={err.password} onChange={(e) => setF({ ...f, password:e.target.value })} />
    <div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-brand-600">Forgot password?</Link></div>
    <Button type="submit" loading={busy} className="w-full">Log in</Button>
    <p className="text-center text-sm text-ink-700">New here? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link></p></form></div>
}
