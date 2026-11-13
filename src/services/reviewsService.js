import api, { isMock, mock, mockFail } from '../api/client'
import { db, save, nextId } from '../data/mockDb'
export const reviewsService = {
  forChef: (chefId) => isMock('reviews')
    ? mock(db().reviews.filter((r) => r.chef_id === Number(chefId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    : api.get(`/chefs/${chefId}/reviews`).then((r) => r.items || r),
  create: ({ booking_id, rating, comment }, { user } = {}) => {
    if (!isMock('reviews')) return api.post('/reviews', { booking_id, rating, comment })
    const x = db(), b = x.bookings.find((k) => k.id === booking_id)
    if (!b || b.status !== 'Completed') return mockFail('Only completed bookings can be reviewed', 409)
    if (b.reviewed) return mockFail('You already reviewed this booking', 409)
    const r = { id: nextId(), booking_id, chef_id: b.chef_id, customer_name: user?.name || 'Customer', rating, comment, created_at: new Date().toISOString() }
    x.reviews.push(r); b.reviewed = true
    const c = x.chefs.find((k) => k.id === b.chef_id)
    if (c) { c.rating = Math.round(((c.rating * c.reviews + rating) / (c.reviews + 1)) * 10) / 10; c.reviews += 1 }
    save(); return mock(r)
  },
}
