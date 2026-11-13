import { MODE } from '../api/client'
import { chefs as seedChefs } from './chefs'
const KEY = 'hmc_mockdb_v1'
const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
const evt = (n, time = '19:00') => `${d(n)}T${time}:00`
const full = MODE === 'true'  // seed demo bookings only in pure mock mode; hybrid starts clean (real chefs have different ids)

function seed() {
  const chefs = seedChefs.map((c) => ({ ...c, user_id: 100 + c.id }))
  const c = (id) => chefs.find((x) => x.id === id)
  const mk = (id, chefId, cust, st, n, g, svc, price, loc) => ({ id, customer_id: 1, customer_name: cust, chef_id: chefId, chef_name: c(chefId).name, chef_photo: c(chefId).photo, service_type: svc, event_date: evt(n), guests: g, cuisine: c(chefId).cuisines[0], location: loc, notes: '', estimated_price: price, status: st, created_at: new Date(Date.now() - 864e5 * 3).toISOString(), reviewed: false })
  return {
    chefs,
    bookings: full ? [
      mk(1, 1, 'Demo Customer', 'Pending', 9, 12, 'Birthday party', 3500, 'Beach Road, Nellore'),
      mk(2, 4, 'Demo Customer', 'Accepted', 4, 8, 'Family dinner', 2100, 'Dargamitta, Nellore'),
      mk(3, 1, 'Sneha P.', 'Completed', -20, 25, 'Wedding / Reception', 7000, 'Stonehousepet, Nellore'),
      mk(4, 5, 'Demo Customer', 'Completed', -12, 15, 'Corporate event', 5200, 'Vedayapalem, Nellore'),
      mk(5, 1, 'Karthik M.', 'Completed', -45, 10, 'Family dinner', 2900, 'Magunta Layout, Nellore'),
      mk(6, 1, 'Divya R.', 'Rejected', -8, 40, 'Wedding / Reception', 9500, 'Podalakur Road, Nellore'),
    ] : [],
    reviews: full ? [
      { id: 1, booking_id: 3, chef_id: 1, customer_name: 'Sneha P.', rating: 5, comment: 'Wonderful Andhra feast. Everyone asked for the recipe of the gongura dal!', created_at: new Date(Date.now() - 864e5 * 18).toISOString() },
      { id: 2, booking_id: 5, chef_id: 1, customer_name: 'Karthik M.', rating: 5, comment: 'Punctual, clean and the food tasted like home.', created_at: new Date(Date.now() - 864e5 * 40).toISOString() },
      { id: 3, booking_id: 99, chef_id: 1, customer_name: 'Divya R.', rating: 4, comment: 'Great taste. Service started a little late but worth it.', created_at: new Date(Date.now() - 864e5 * 70).toISOString() },
    ] : [],
    messages: full ? [
      { id: 1, customer_id: 1, chef_id: 1, customer_name: 'Demo Customer', chef_name: 'Ravi Kumar', sender: 'customer', content: 'Hi Chef, can you do a mild-spice menu for my daughter’s birthday?', at: new Date(Date.now() - 36e5 * 5).toISOString() },
      { id: 2, customer_id: 1, chef_id: 1, customer_name: 'Demo Customer', chef_name: 'Ravi Kumar', sender: 'chef', content: 'Of course! I’ll keep the spice mild and add a kids’ corner. Please share the guest count.', at: new Date(Date.now() - 36e5 * 4).toISOString() },
    ] : [],
    favorites: full ? { 1: [2, 4] } : {},
    blocked: full ? { 1: [d(14), d(15)] } : {},
    users: [
      { id: 1, full_name: 'Demo Customer', email: 'customer@demo.com', role: 'customer' },
      { id: 101, full_name: 'Ravi Kumar', email: 'chef1@demo.com', role: 'chef' },
      { id: 900, full_name: 'Admin', email: 'admin@demo.com', role: 'admin' },
    ],
    nextId: 1000,
  }
}
let cache
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed() } catch { return seed() } }
export const db = () => (cache ||= load())
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* storage full or blocked */ } }
export const nextId = () => { const x = db(); x.nextId += 1; save(); return x.nextId }
export const resetMockDb = () => { cache = seed(); save() }
