import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'
export default function Footer() {
  return <footer className="bg-ink-900 text-cream-200"><div className="container-x grid gap-8 py-12 md:grid-cols-4">
    <div className="md:col-span-2"><p className="flex items-center gap-2 font-display text-xl font-bold text-white"><ChefHat />Hire My Chef</p><p className="mt-3 max-w-sm text-sm text-cream-200/70">AI-powered platform connecting you with professional chefs for home dining, parties and special events.</p></div>
    <div><p className="mb-3 font-semibold text-white">Platform</p><ul className="space-y-2 text-sm text-cream-200/70"><li><Link to="/chefs">Explore Chefs</Link></li><li><Link to="/how-it-works">How it Works</Link></li><li><Link to="/register">Become a Chef</Link></li></ul></div>
    <div><p className="mb-3 font-semibold text-white">Company</p><ul className="space-y-2 text-sm text-cream-200/70"><li><Link to="/about">About</Link></li><li><Link to="/faq">FAQ</Link></li><li><Link to="/contact">Contact</Link></li></ul></div>
  </div><div className="border-t border-white/10 py-4 text-center text-xs text-cream-200/60">© 2026 Hire My Chef. All rights reserved.</div></footer>
}
