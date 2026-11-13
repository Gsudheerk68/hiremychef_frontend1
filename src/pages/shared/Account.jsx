import { Link, useNavigate } from 'react-router-dom'
import DashHeader from '../../components/common/DashHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
export default function Account() {
  const { user, logout } = useAuth(); const nav = useNavigate()
  const row = (k, v) => <div className="flex justify-between gap-4 border-b border-cream-200 py-3 text-sm last:border-0"><dt className="text-ink-700">{k}</dt><dd className="font-medium text-ink-900">{v}</dd></div>
  return <><DashHeader title="Account" text="Your sign-in details." />
    <div className="card max-w-xl p-6"><dl>{row('Name', user.name)}{row('Email', user.email)}{row('Role', <Badge>{user.role}</Badge>)}</dl>
      <div className="mt-6 flex flex-wrap gap-2"><Link to="/forgot-password"><Button variant="secondary">Reset password</Button></Link><Button variant="ghost" onClick={() => { logout(); nav('/') }}>Log out</Button></div>
      <p className="mt-4 text-xs text-ink-700/70">Editing name, email and phone will be available once the backend exposes a profile-update endpoint.</p></div></>
}
