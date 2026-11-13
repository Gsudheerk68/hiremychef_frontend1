import api, { isMock, mock, mockFail } from '../api/client'
import { db, save } from '../data/mockDb'
import { dayOf, iso, addDays } from '../utils/format'

const clean = (p = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v != null))
const unavailableOn = (chefId, day) => {
  const x = db()
  return (x.blocked[chefId] || []).includes(day) || x.bookings.some((b) => b.chef_id === chefId && b.status === 'Accepted' && dayOf(b.event_date) === day)
}
const SORT = {
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price,
  experience: (a, b) => b.years - a.years, newest: (a, b) => b.id - a.id,
}
function filterMock(p) {
  const q = (p.q || '').toLowerCase(), cu = (p.cuisine || '').toLowerCase()
  let list = db().chefs.filter((c) => c.verified !== false)
    .filter((c) => !q || [c.name, c.city, c.bio, ...c.cuisines].join(' ').toLowerCase().includes(q))
    .filter((c) => !p.city || c.city.toLowerCase() === p.city.toLowerCase())
    .filter((c) => !cu || c.cuisines.join(' ').toLowerCase().includes(cu))
    .filter((c) => p.min_price == null || c.price >= +p.min_price).filter((c) => p.max_price == null || c.price <= +p.max_price)
    .filter((c) => p.min_rating == null || c.rating >= +p.min_rating).filter((c) => p.min_experience == null || c.years >= +p.min_experience)
    .filter((c) => !p.available_on || !unavailableOn(c.id, p.available_on))
  list = list.sort(SORT[p.sort] || SORT.rating)
  const size = +p.page_size || 12, page = +p.page || 1
  return { items: list.slice((page - 1) * size, page * size), total: list.length, page, page_size: size, pages: Math.ceil(list.length / size) }
}
// Real backend returns the same shape; this also tolerates a bare array.
const asPage = (r) => Array.isArray(r) ? { items: r, total: r.length, page: 1, page_size: r.length, pages: 1 } : r

export const chefsService = {
  list: (params) => isMock('chefs') ? mock(filterMock(clean(params))) : api.get('/chefs', { params: clean(params) }).then(asPage),
  get: (id) => isMock('chefs')
    ? (db().chefs.find((c) => c.id === Number(id)) ? mock(db().chefs.find((c) => c.id === Number(id))) : mockFail('Chef not found', 404))
    : api.get('/chefs/' + id),
  recommended: (limit = 4) => isMock('chefs') ? mock([...db().chefs].sort((a, b) => b.match - a.match).slice(0, limit)) : api.get('/chefs/recommended', { params: { limit } }),
  availability: (id, { start = iso(new Date()), end = iso(addDays(new Date(), 120)) } = {}) => {
    if (!isMock('chefs')) return api.get(`/chefs/${id}/availability`, { params: { start, end } })
    const x = db(), inRange = (d) => d >= start && d <= end
    return mock({ start, end, blocked: (x.blocked[id] || []).filter(inRange).sort(),
      booked: [...new Set(x.bookings.filter((b) => b.chef_id === Number(id) && b.status === 'Accepted').map((b) => dayOf(b.event_date)).filter(inRange))].sort() })
  },
  // ----- chef self-service (role = chef). Field names follow the backend's ChefUpdate. -----
  me: () => isMock('chefs') ? mock(db().chefs.find((c) => c.id === 1)) : api.get('/chefs/me'),
  updateMe: (body) => {
    if (!isMock('chefs')) return api.put('/chefs/me', body)
    const c = db().chefs.find((x) => x.id === 1), map = { years_experience: 'years', price_per_session: 'price', photo_url: 'photo', is_available: 'available' }
    Object.entries(body).forEach(([k, v]) => { if (v !== undefined) c[map[k] || k] = v })
    save(); return mock(c)
  },
  block: (dates) => {
    if (!isMock('chefs')) return api.post('/chefs/me/availability/block', { dates })
    const x = db(); x.blocked[1] = [...new Set([...(x.blocked[1] || []), ...dates])]; save(); return mock(null, 200)
  },
  unblock: (dates) => {
    if (!isMock('chefs')) return api.post('/chefs/me/availability/unblock', { dates })
    const x = db(); x.blocked[1] = (x.blocked[1] || []).filter((d) => !dates.includes(d)); save(); return mock(null, 200)
  },
}
