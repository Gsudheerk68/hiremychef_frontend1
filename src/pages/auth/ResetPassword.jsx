import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import AuthCard from '../../components/common/AuthCard'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { validatePassword } from '../../utils/validators'
export default function ResetPassword() {
  const [params] = useSearchParams(); const token = params.get('token'); const nav = useNavigate(); const toast = useToast()
  const [f, setF] = useState({ p:'', c:'' }); const [err, setErr] = useState({}); const [busy, setBusy] = useState(false)
  if (!token) return <AuthCard title="Invalid link" text="This reset link is missing its token. Please request a new one."><Link to="/forgot-password" className="font-semibold text-brand-600">Request a new link</Link></AuthCard>
  const submit = async (e) => {
    e.preventDefault(); const er = {}
    const pe = validatePassword(f.p); if (pe) er.p = pe; if (f.c !== f.p) er.c = 'Passwords do not match'
    setErr(er); if (Object.keys(er).length) return
    setBusy(true)
    try { await authService.resetPassword({ token, new_password:f.p }); toast('Password updated. Please log in.'); nav('/login') }
    catch (x) { toast(x.message, 'error') } finally { setBusy(false) }
  }
  return <AuthCard title="Set a new password"><form onSubmit={submit} className="space-y-4" noValidate>
    <Input label="New password" type="password" icon={Lock} value={f.p} error={err.p} onChange={(e) => setF({ ...f, p:e.target.value })} />
    <Input label="Confirm password" type="password" icon={Lock} value={f.c} error={err.c} onChange={(e) => setF({ ...f, c:e.target.value })} />
    <Button type="submit" loading={busy} className="w-full">Update password</Button></form></AuthCard>
}
