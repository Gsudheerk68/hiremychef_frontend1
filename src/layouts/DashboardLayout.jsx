import { createContext, useContext, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { ChefHat, LayoutDashboard, CalendarCheck, Heart, MessageSquare, Sparkles, User, Inbox, CalendarDays, Wallet, Star, Users, BadgeCheck, ClipboardList, Search, LogOut, Menu, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { chefsService } from '../services/chefsService'
import useAsync from '../hooks/useAsync'
import ErrorState from '../components/common/ErrorState'
import Skeleton from '../components/common/Skeleton'

const NAV = {
  customer: [['/customer', 'Overview', LayoutDashboard, true], ['/chefs', 'Find chefs', Search], ['/customer/bookings', 'My bookings', CalendarCheck], ['/customer/favorites', 'Favourites', Heart],
    ['/customer/messages', 'Messages', MessageSquare], ['/customer/ai', 'AI assistant', Sparkles], ['/customer/account', 'Account', User]],
  chef: [['/chef', 'Overview', LayoutDashboard, true], ['/chef/bookings', 'Booking requests', Inbox], ['/chef/availability', 'Availability', CalendarDays], ['/chef/profile', 'My profile', User],
    ['/chef/earnings', 'Earnings', Wallet], ['/chef/reviews', 'Reviews', Star], ['/chef/messages', 'Messages', MessageSquare]],
  admin: [['/admin', 'Overview', LayoutDashboard, true], ['/admin/chefs', 'Chef approvals', BadgeCheck], ['/admin/users', 'Users', Users], ['/admin/bookings', 'Bookings', ClipboardList]],
}
const Ctx = createContext({ chef: null, reloadChef: () => {} })
export const useDash = () => useContext(Ctx)

export default function DashboardLayout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const [open, setOpen] = useState(false)
  // A chef's profile (id, verified flag) is needed by most chef pages, so it is loaded once here.
  const chefQ = useAsync(() => (user.role === 'chef' ? chefsService.me() : Promise.resolve(null)), [user.role])
  const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-cream-200'}`
  const items = NAV[user.role] || []
  const sidebar = <nav className="flex h-full flex-col" aria-label="Dashboard">
    <Link to="/" className="mb-6 flex items-center gap-2 px-3 font-display text-xl font-bold text-brand-700"><ChefHat className="h-6 w-6" />Hire My Chef</Link>
    <ul className="space-y-1">{items.map(([to, label, Icon, end]) => <li key={to}><NavLink to={to} end={end} className={link} onClick={() => setOpen(false)}><Icon className="h-5 w-5" />{label}</NavLink></li>)}</ul>
    <div className="mt-auto border-t border-cream-200 pt-4">
      <p className="truncate px-3 text-sm font-semibold text-ink-900">{user.name}</p><p className="truncate px-3 text-xs capitalize text-ink-700">{user.role}</p>
      <button onClick={() => { logout(); nav('/') }} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"><LogOut className="h-5 w-5" />Log out</button></div></nav>
  const ready = user.role !== 'chef' || chefQ.data
  return <div className="min-h-screen bg-cream-100 lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="sticky top-0 hidden h-screen border-r border-cream-200 bg-white p-4 lg:block">{sidebar}</aside>
    <div className="lg:hidden"><div className="flex h-14 items-center justify-between border-b border-cream-200 bg-white px-4">
      <Link to="/" className="flex items-center gap-2 font-display font-bold text-brand-700"><ChefHat className="h-5 w-5" />Hire My Chef</Link>
      <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button></div>
      {open && <div className="fixed inset-0 z-50 flex"><div className="w-64 bg-white p-4 shadow-lift"><button aria-label="Close menu" className="mb-2" onClick={() => setOpen(false)}><X /></button>{sidebar}</div><div className="flex-1 bg-ink-900/50" onClick={() => setOpen(false)} /></div>}</div>
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      {user.role === 'chef' && chefQ.data && !chefQ.data.verified && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p><b>Your profile is awaiting admin approval.</b> Customers cannot see or book you until an admin verifies your account. Complete your profile in the meantime.</p></div>}
      {chefQ.error ? <ErrorState message={chefQ.error} onRetry={chefQ.reload} /> : !ready ? <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-40" /></div>
        : <Ctx.Provider value={{ chef: chefQ.data, reloadChef: chefQ.reload }}><Outlet /></Ctx.Provider>}
    </main></div>
}
