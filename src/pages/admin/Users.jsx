import { useState } from 'react'
import { Search } from 'lucide-react'
import DashHeader from '../../components/common/DashHeader'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Badge from '../../components/common/Badge'
import Skeleton from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'
import useAsync from '../../hooks/useAsync'
import { adminService } from '../../services/adminService'

const TONE = { admin: 'Rejected', chef: 'Accepted', customer: 'Completed' }
export default function AdminUsers() {
  const { data, loading, error, reload } = useAsync(() => adminService.users(), [])
  const [q, setQ] = useState(''); const [role, setRole] = useState('')
  const rows = (data || []).filter((u) => (!role || u.role === role) && (!q || `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase())))
  return <>
    <DashHeader title="Users" text="Everyone registered on the platform." />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><Input className="flex-1" icon={Search} placeholder="Search name or email" aria-label="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
      <Select className="sm:w-44" aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option value="customer">Customers</option><option value="chef">Chefs</option><option value="admin">Admins</option></Select></div>
    {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : <div className="card overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="border-b border-cream-200 text-ink-700"><tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th></tr></thead>
      <tbody>{rows.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-ink-700">No users match.</td></tr> : rows.map((u) => <tr key={u.id} className="border-b border-cream-200 last:border-0"><td className="p-4 text-ink-700">#{u.id}</td><td className="p-4 font-medium">{u.full_name}</td><td className="p-4">{u.email}</td><td className="p-4"><Badge tone={TONE[u.role]}>{u.role}</Badge></td></tr>)}</tbody></table></div>}</>
}
