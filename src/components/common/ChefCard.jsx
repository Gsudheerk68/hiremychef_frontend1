import { Link } from 'react-router-dom'
import { Star, MapPin, Heart } from 'lucide-react'
import Img from './Img'
import Badge from './Badge'
export default function ChefCard({ chef, fav, onToggleFav }) {
  return <article className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
    <div className="relative"><Img src={chef.photo} alt={`Chef ${chef.name}`} className="h-52 w-full" />
      <span className="absolute left-3 top-3"><Badge tone={chef.available ? 'Completed' : 'Cancelled'}>{chef.available ? 'Available' : 'Booked'}</Badge></span>
      {onToggleFav && <button type="button" aria-pressed={!!fav} aria-label={fav ? 'Remove from favourites' : 'Save to favourites'} onClick={() => onToggleFav(chef.id, !fav)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft transition hover:scale-105"><Heart className={`h-5 w-5 ${fav ? 'fill-red-500 text-red-500' : 'text-ink-700'}`} /></button>}</div>
    <div className="space-y-2 p-5">
      <div className="flex items-start justify-between"><h3 className="text-lg">{chef.name}</h3><span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{chef.rating}<span className="font-normal text-ink-700">({chef.reviews})</span></span></div>
      <p className="flex items-center gap-1 text-sm text-ink-700"><MapPin className="h-4 w-4" />{chef.city || 'Location not set'} · {chef.years} yrs</p>
      <div className="flex flex-wrap gap-1.5">{chef.cuisines.map((c) => <Badge key={c}>{c}</Badge>)}</div>
      <div className="flex items-center justify-between border-t border-dashed border-cream-200 pt-3"><p><span className="text-lg font-bold">₹{chef.price.toLocaleString('en-IN')}</span><span className="text-xs text-ink-700"> /session</span></p>
        <Link to={`/chefs/${chef.id}`} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">View Profile</Link></div>
    </div></article>
}
