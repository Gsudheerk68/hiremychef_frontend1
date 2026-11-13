import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import ChefCard from '../../components/common/ChefCard'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Pagination from '../../components/common/Pagination'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import useAsync from '../../hooks/useAsync'
import useDebounce from '../../hooks/useDebounce'
import useFavorites from '../../hooks/useFavorites'
import { chefsService } from '../../services/chefsService'
import { cuisines } from '../../data/chefs'
import { todayISO } from '../../utils/format'

const CITIES = ['Nellore', 'Hyderabad', 'Bengaluru', 'Vijayawada', 'Chennai', 'Visakhapatnam', 'Tirupati']
const SORTS = [['rating', 'Top rated'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['experience', 'Most experienced'], ['newest', 'Newest']]
const FIELDS = ['city', 'cuisine', 'min_price', 'max_price', 'min_rating', 'min_experience', 'available_on']
const draftOf = (sp) => ({ ...Object.fromEntries(FIELDS.map((k) => [k, sp.get(k) || ''])), available_on: sp.get('available_on') || sp.get('date') || '' })

export default function Explore() {
  const [sp, setSp] = useSearchParams()
  const key = sp.toString()
  const [draft, setDraft] = useState(() => draftOf(sp))
  const [q, setQ] = useState(sp.get('q') || '')
  const [panel, setPanel] = useState(false)
  const fav = useFavorites()
  const dq = useDebounce(q)

  const merge = (patch) => {
    const next = new URLSearchParams(sp); next.delete('date'); next.delete('event')
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)))
    if (!('page' in patch)) next.delete('page')
    setSp(next)
  }
  useEffect(() => { setDraft(draftOf(sp)) }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (dq !== (sp.get('q') || '')) merge({ q: dq.trim() }) }, [dq]) // eslint-disable-line react-hooks/exhaustive-deps

  const params = { q: sp.get('q') || '', ...Object.fromEntries(FIELDS.map((k) => [k, sp.get(k) || ''])), available_on: sp.get('available_on') || sp.get('date') || '',
    sort: sp.get('sort') || 'rating', page: Number(sp.get('page')) || 1, page_size: 9 }
  const { data, loading, error, reload } = useAsync(() => chefsService.list(params), [key])
  const active = FIELDS.filter((k) => params[k]).length + (params.q ? 1 : 0)
  const apply = (e) => { e.preventDefault(); merge(draft); setPanel(false) }
  const clear = () => { setQ(''); setSp(new URLSearchParams(params.sort !== 'rating' ? { sort: params.sort } : {})); setPanel(false) }
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value })

  const filters = <form onSubmit={apply} className="space-y-4">
    <Input label="City" list="cities" placeholder="e.g. Nellore" value={draft.city} onChange={set('city')} /><datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
    <Select label="Cuisine" value={draft.cuisine} onChange={set('cuisine')}><option value="">Any cuisine</option>{cuisines.map((c) => <option key={c.name}>{c.name}</option>)}</Select>
    <div className="grid grid-cols-2 gap-3"><Input label="Min price (₹)" type="number" min="0" value={draft.min_price} onChange={set('min_price')} /><Input label="Max price (₹)" type="number" min="0" value={draft.max_price} onChange={set('max_price')} /></div>
    <Select label="Minimum rating" value={draft.min_rating} onChange={set('min_rating')}><option value="">Any rating</option><option value="4">4.0 and above</option><option value="4.5">4.5 and above</option><option value="4.8">4.8 and above</option></Select>
    <Select label="Experience" value={draft.min_experience} onChange={set('min_experience')}><option value="">Any experience</option><option value="3">3+ years</option><option value="7">7+ years</option><option value="10">10+ years</option><option value="15">15+ years</option></Select>
    <Input label="Available on" type="date" min={todayISO()} value={draft.available_on} onChange={set('available_on')} />
    <div className="flex gap-2"><Button type="submit" className="flex-1">Apply filters</Button><Button type="button" variant="secondary" onClick={clear}>Clear</Button></div></form>

  return <>
    <PageHeader kicker="Explore" title="Find your chef" text="Verified professionals for dinners, parties and special events. Filter by cuisine, budget, rating and availability." />
    <div className="container-x section pt-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input className="flex-1" icon={Search} placeholder="Search by name, city, cuisine…" aria-label="Search chefs" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="sm:w-56" aria-label="Sort by" value={params.sort} onChange={(e) => merge({ sort: e.target.value })}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
        <Button variant="secondary" className="lg:hidden" onClick={() => setPanel(true)}><SlidersHorizontal className="h-4 w-4" />Filters{active ? ` (${active})` : ''}</Button></div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="card hidden h-fit p-5 lg:sticky lg:top-24 lg:block"><p className="mb-4 font-display text-lg font-semibold text-ink-900">Filters</p>{filters}</aside>
        {panel && <div className="fixed inset-0 z-50 flex lg:hidden"><div className="flex-1 bg-ink-900/50" onClick={() => setPanel(false)} />
          <div className="w-80 max-w-[90vw] overflow-y-auto bg-white p-5"><div className="mb-4 flex items-center justify-between"><p className="font-display text-lg font-semibold">Filters</p><button aria-label="Close filters" onClick={() => setPanel(false)}><X /></button></div>{filters}</div></div>}
        <section aria-live="polite">
          {!loading && data && <p className="mb-4 text-sm text-ink-700"><b className="text-ink-900">{data.total}</b> chef{data.total === 1 ? '' : 's'} found{params.available_on && ` available on ${params.available_on}`}</p>}
          {error ? <ErrorState message={error} onRetry={reload} />
            : !data ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-80" />)}</div>
            : data.items.length === 0 ? <EmptyState icon="🔍" title="No chefs match your filters" text="Try a different city or cuisine, widen your budget, or clear the filters." action={<Button onClick={clear}>Clear filters</Button>} />
            : <div className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>{data.items.map((c) => <ChefCard key={c.id} chef={c} fav={fav.ids.includes(c.id)} onToggleFav={fav.enabled ? fav.toggle : undefined} />)}</div>}
          {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => { merge({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}
        </section></div></div></>
}
