import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, ChefHat } from 'lucide-react'
import Button from '../common/Button'
import { useAuth, dashboardPath } from '../../context/AuthContext'
const links = [['/chefs','Explore Chefs'],['/how-it-works','How it Works'],['/about','About'],['/faq','FAQ'],['/contact','Contact']]
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth(); const nav = useNavigate()
  const cls = ({ isActive }) => `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-ink-700 hover:text-brand-600'}`
  return <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-100/90 backdrop-blur">
    <div className="container-x flex h-16 items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-brand-700"><ChefHat className="h-6 w-6" />Hire My Chef</Link>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Main">{links.map(([to, l]) => <NavLink key={to} to={to} className={cls}>{l}</NavLink>)}</nav>
      <div className="hidden items-center gap-2 md:flex">
        {user ? <><Button variant="secondary" size="sm" onClick={() => nav(dashboardPath(user.role))}>Dashboard</Button><Button variant="ghost" size="sm" onClick={() => { logout(); nav('/') }}>Logout</Button></>
        : <><Button variant="ghost" size="sm" onClick={() => nav('/login')}>Login</Button><Button size="sm" onClick={() => nav('/register')}>Get Started</Button></>}
      </div>
      <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div className="container-x space-y-3 pb-4 md:hidden">{links.map(([to, l]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={(s) => cls(s) + ' block py-1'}>{l}</NavLink>)}
      <Link to={user ? dashboardPath(user.role) : '/login'} onClick={() => setOpen(false)} className="block font-semibold text-brand-600">{user ? 'Dashboard' : 'Login / Register'}</Link></div>}
  </header>
}
