import api, { isMock, mock } from '../api/client'
import { db, save } from '../data/mockDb'
import { bookingsService } from './bookingsService'

const mockChefAdmin = () => db().chefs.map((c) => ({ ...c }))
export const adminService = {
  // Backend: GET /admin/chefs?verified=false  (returns a plain list, including unverified chefs)
  chefs: (verified) => isMock('admin.chefs') ? mock(mockChefAdmin().filter((c) => verified == null || !!c.verified === verified))
    : api.get('/admin/chefs', { params: verified == null ? {} : { verified } }),
  // Backend: POST /admin/chefs/{id}/verify | /unverify
  setVerified: (id, value) => {
    if (!isMock('admin.chefs')) return api.post(`/admin/chefs/${id}/${value ? 'verify' : 'unverify'}`)
    const c = db().chefs.find((x) => x.id === id); if (c) c.verified = value; save(); return mock(c)
  },
  // Backend: GET /admin/users  (id, full_name, email, role)
  users: () => isMock('admin.users') ? mock(db().users) : api.get('/admin/users'),
  bookings: () => bookingsService.all(),
  /** Composed from existing endpoints so it works with the Phase 3 backend; bookings are included once /admin/bookings exists. */
  stats: async () => {
    const [users, chefs, bookings] = await Promise.all([adminService.users(), adminService.chefs(), adminService.bookings()])
    const byStatus = {}; bookings.forEach((b) => { byStatus[b.status] = (byStatus[b.status] || 0) + 1 })
    const months = {}
    bookings.forEach((b) => { const k = new Date(b.event_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }); months[k] = (months[k] || 0) + 1 })
    return {
      users: users.length, customers: users.filter((u) => u.role === 'customer').length,
      chefs: chefs.length, verifiedChefs: chefs.filter((c) => c.verified).length, pendingChefs: chefs.filter((c) => !c.verified).length,
      bookings: bookings.length, revenue: bookings.filter((b) => b.status === 'Completed').reduce((s, b) => s + b.estimated_price, 0),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      monthly: Object.entries(months).map(([month, count]) => ({ month, count })),
    }
  },
}
