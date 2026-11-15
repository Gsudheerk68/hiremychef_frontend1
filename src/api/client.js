import axios from 'axios'
/**
 * VITE_USE_MOCK:
 *   true   – everything uses local mock data (no backend needed)
 *   false  – everything calls the FastAPI backend
 *   hybrid – real backend for what Phase 1-3 provides (auth, chefs, admin chef approval, admin users),
 *            mock data for what is not built yet (bookings, reviews, messages, favorites, AI)
 */
export const MODE = String(import.meta.env.VITE_USE_MOCK ?? 'true')
export const USE_MOCK = MODE === 'true'
const LIVE_IN_HYBRID = new Set(['auth', 'chefs', 'admin.chefs', 'admin.users', 'bookings', 'reviews', 'ai.chat'])
export const isMock = (domain) => MODE === 'true' || (MODE === 'hybrid' && !LIVE_IN_HYBRID.has(domain))
export const TOKEN_KEY = 'hmc_token'
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1', timeout: 15000 })
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(TOKEN_KEY)
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
api.interceptors.response.use((r) => r.data, (err) => {
  if (err.response?.status === 401) { localStorage.removeItem(TOKEN_KEY); window.dispatchEvent(new Event('hmc:unauthorized')) }
  const d = err.response?.data?.detail
  const message = Array.isArray(d) ? d.map((x) => `${x.loc?.slice(-1)[0] ?? ''}: ${x.msg}`).join('; ') : d || err.message || 'Something went wrong'
  return Promise.reject({ status: err.response?.status, message })
})
export const mock = (data, ms = 350) => new Promise((res) => setTimeout(() => res(data === undefined ? data : structuredClone(data)), ms))
export const mockFail = (message, status = 400, ms = 250) => new Promise((_, rej) => setTimeout(() => rej({ status, message }), ms))
export default api
