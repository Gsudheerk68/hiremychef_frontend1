import api, { isMock, mock, mockFail } from '../api/client'
import { db, save, nextId } from '../data/mockDb'
import { dayOf } from '../utils/format'
import { estimatePrice } from '../utils/pricing'

// Accept either flat fields (mock) or nested objects (a likely shape for the Phase 4 API).
const norm = (b) => ({ ...b, chef_name: b.chef_name ?? b.chef?.name, chef_photo: b.chef_photo ?? b.chef?.photo,
  customer_name: b.customer_name ?? b.customer?.full_name, estimated_price: Number(b.estimated_price ?? 0) })
const STATUS = { accept: 'Accepted', reject: 'Rejected', cancel: 'Cancelled', complete: 'Completed' }
const FROM = { accept: ['Pending'], reject: ['Pending'], cancel: ['Pending', 'Accepted'], complete: ['Accepted'] }
const sortRecent = (a, b) => new Date(b.event_date) - new Date(a.event_date)

export const bookingsService = {
  /** ctx = { role, userId, chefId }. Real API filters by the token, so ctx is only used by the mock. */
  list: (ctx = {}) => {
    if (!isMock('bookings')) return api.get('/bookings').then((r) => (r.items || r).map(norm))
    const all = db().bookings
    const mine = ctx.role === 'chef' ? all.filter((b) => b.chef_id === ctx.chefId) : all.filter((b) => b.customer_id === ctx.userId)
    return mock([...mine].sort(sortRecent))
  },
  create: (body, { chef, user } = {}) => {
    if (!isMock('bookings')) return api.post('/bookings', body).then(norm)
    const x = db(), day = dayOf(body.event_date)
    if ((x.blocked[body.chef_id] || []).includes(day) || x.bookings.some((b) => b.chef_id === body.chef_id && b.status === 'Accepted' && dayOf(b.event_date) === day))
      return mockFail('The chef is not available on that date', 409)
    const b = { id: nextId(), customer_id: user.id, customer_name: user.name, chef_id: chef.id, chef_name: chef.name, chef_photo: chef.photo,
      ...body, status: 'Pending', created_at: new Date().toISOString(), reviewed: false }
    x.bookings.push(b); save(); return mock(b)
  },
  /** action: accept | reject | cancel | complete  →  POST /bookings/{id}/{action} */
  act: (id, action) => {
    if (!isMock('bookings')) return api.post(`/bookings/${id}/${action}`).then(norm)
    const b = db().bookings.find((x) => x.id === id)
    if (!b) return mockFail('Booking not found', 404)
    if (!FROM[action].includes(b.status)) return mockFail(`A ${b.status.toLowerCase()} booking cannot be ${STATUS[action].toLowerCase()}`, 409)
    if (action === 'accept' && db().bookings.some((o) => o.id !== id && o.chef_id === b.chef_id && o.status === 'Accepted' && dayOf(o.event_date) === dayOf(b.event_date)))
      return mockFail('You already have an accepted booking on that date', 409)
    b.status = STATUS[action]; save(); return mock(b)
  },
  /** Tries POST /bookings/estimate; falls back to the same formula client-side if the endpoint is not there yet. */
  estimate: async ({ chef, guests, service_type }) => {
    const local = estimatePrice(chef.price, guests, service_type)
    if (isMock('bookings')) return local
    try { const r = await api.post('/bookings/estimate', { chef_id: chef.id, guests, service_type }); return { ...local, total: Number(r.estimated_price ?? r.total ?? local.total) } }
    catch { return local }
  },
  // admin
  all: () => isMock('bookings') ? mock([...db().bookings].sort(sortRecent)) : api.get('/admin/bookings').then((r) => (r.items || r).map(norm)).catch(() => []),
}
