import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthCard from '../../components/common/AuthCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { isEmail } from '../../utils/validators'
export default function ForgotPassword() {
  const toast = useToast(); const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); if (!isEmail(email)) return setErr('Enter a valid email')
    setErr(''); setBusy(true)
    try { await authService.forgotPassword(email); setSent(true) } catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  return <AuthCard title="Forgot password?" text="Enter your email and we’ll send you a reset link.">
    {sent ? <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">If that email is registered, a reset link has been sent. Please check your inbox.</div>
    : <form onSubmit={submit} className="space-y-4" noValidate><Input label="Email" type="email" icon={Mail} value={email} error={err} onChange={(e) => setEmail(e.target.value)} /><Button type="submit" loading={busy} className="w-full">Send reset link</Button></form>}
    <p className="text-center text-sm"><Link to="/login" className="font-semibold text-brand-600">Back to login</Link></p></AuthCard>
}
