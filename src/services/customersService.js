import api, { isMock, mock } from '../api/client'
import { db, save } from '../data/mockDb'
import { chefsService } from './chefsService'
export const customersService = {
  favoriteIds: (userId) => isMock('customers') ? mock(db().favorites[userId] || [], 100) : api.get('/customers/me/favorites').then((r) => (r.items || r).map((c) => c.id)),
  favorites: async (userId) => {
    if (!isMock('customers')) return api.get('/customers/me/favorites').then((r) => r.items || r)
    const ids = db().favorites[userId] || []
    return (await Promise.all(ids.map((id) => chefsService.get(id).catch(() => null)))).filter(Boolean)
  },
  setFavorite: (chefId, on, userId) => {
    if (!isMock('customers')) return on ? api.post(`/customers/me/favorites/${chefId}`) : api.delete(`/customers/me/favorites/${chefId}`)
    const x = db(), cur = new Set(x.favorites[userId] || []); on ? cur.add(chefId) : cur.delete(chefId)
    x.favorites[userId] = [...cur]; save(); return mock({ ok: true }, 120)
  },
}
