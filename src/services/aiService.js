import api, { isMock, mock } from '../api/client'
import { chefsService } from './chefsService'
import { menuFor, knownCuisines } from '../data/menus'
import { estimatePrice } from '../utils/pricing'

const CUISINE_WORDS = { 'south indian':'South Indian', andhra:'Andhra', mughlai:'Mughlai', biryani:'Biryani', italian:'Italian', continental:'Continental', veg:'Vegetarian', vegetarian:'Vegetarian', bbq:'BBQ', grill:'BBQ', party:'Party Catering', kerala:'Kerala', seafood:'Seafood', fish:'Seafood' }
const CITIES = ['Nellore', 'Hyderabad', 'Bengaluru', 'Vijayawada', 'Chennai', 'Visakhapatnam', 'Tirupati']

/** Very small rule-based stand-in for the Phase 6 ML recommender: it extracts cuisine, city, budget and guests
 *  from the text, then scores every chef. The real endpoint POST /ai/chat should return the same response shape. */
function parse(text) {
  const t = text.toLowerCase()
  const cuisines = [...new Set(Object.entries(CUISINE_WORDS).filter(([k]) => t.includes(k)).map(([, v]) => v))]
  const city = CITIES.find((c) => t.includes(c.toLowerCase()))
  const budget = +(t.match(/(?:₹|rs\.?|inr|budget(?: of| is)?)\s*(\d[\d,]*)/)?.[1] || '').replace(/,/g, '') || null
  const guests = +(t.match(/(\d+)\s*(?:people|guests|persons|pax|members)/)?.[1]) || null
  return { cuisines, city, budget, guests }
}
async function mockChat(message) {
  const p = parse(message), guests = p.guests || 10
  const { items } = await chefsService.list({ page_size: 50 })
  const ranked = items.map((c) => {
    let score = c.rating * 10, why = []
    const hit = p.cuisines.filter((x) => c.cuisines.some((cc) => cc.toLowerCase().includes(x.toLowerCase())))
    if (hit.length) { score += 30; why.push(`cooks ${hit.join(' & ')}`) }
    if (p.city && c.city?.toLowerCase() === p.city.toLowerCase()) { score += 25; why.push(`is based in ${c.city}`) }
    const est = estimatePrice(c.price, guests, 'Family dinner').total
    if (p.budget) { if (est <= p.budget) { score += 15; why.push(`fits your ₹${p.budget.toLocaleString('en-IN')} budget`) } else score -= 10 }
    if (c.available) { score += 10; why.push('is currently taking bookings') }
    return { ...c, match: Math.max(40, Math.min(99, Math.round(score * 0.72))), reason: why.length ? `${c.name} ${why.join(', ')}.` : `${c.name} is one of our top-rated chefs.`, estimate: est }
  }).sort((a, b) => b.match - a.match).slice(0, 3)
  const found = [p.cuisines.join(', '), p.city, p.guests && `${p.guests} guests`, p.budget && `₹${p.budget.toLocaleString('en-IN')} budget`].filter(Boolean)
  const reply = found.length ? `Here are my top matches for ${found.join(' · ')}.` : 'I could not pick out a cuisine, city or budget, so these are our top-rated chefs. Tell me the cuisine, city, number of guests and budget for sharper matches.'
  return { reply, chefs: ranked }
}
function mockMenu({ cuisine, guests = 10, diet = 'any', budget }) {
  const vegOnly = diet === 'vegetarian' || diet === 'vegan' || diet === 'jain'
  const courses = menuFor(cuisine, { vegOnly })
  const perHead = Math.round((estimatePrice(2800, guests, 'Family dinner').total / Math.max(guests, 1)) / 10) * 10
  const tips = ['Confirm allergies with your chef at least 48 hours ahead.', `For ${guests} guests, plan 2 starters, 3 mains and 1 dessert.`]
  if (diet === 'jain') tips.push('Jain menus avoid onion, garlic and root vegetables. Ask the chef to confirm each dish.')
  if (budget && perHead * guests > budget) tips.push('This menu may exceed your budget. Drop one starter or one dessert to save roughly 15%.')
  return { title: `${cuisine} menu for ${guests} guests`, diet, courses, estimated_cost_per_head: perHead, tips }
}
/** Converts POST /ai/recommend into the { reply, chefs } shape AIAssistant.jsx already renders. */
const THREAD_KEY = 'hmc_chat_thread'
const CHAT_TIMEOUT = 300000 // local LLMs on CPU can take a few minutes

/** Maps POST /ai/chat and /ai/chat/confirm to { reply, chefs, pending }. */
function fromChat(res) {
  if (res.thread_id) sessionStorage.setItem(THREAD_KEY, res.thread_id)
  return { reply: res.reply, chefs: [], pending: res.pending_confirmation || null }
}

export const aiService = {
  chat: (message) => {
    if (isMock('ai.chat')) return mockChat(message).then((r) => mock(r, 600))
    const thread_id = sessionStorage.getItem(THREAD_KEY) || undefined
    return api.post('/ai/chat', { message, thread_id }, { timeout: CHAT_TIMEOUT }).then(fromChat)
  },
  // answer a pending booking confirmation (true = book it, false = cancel)
  confirm: (confirm) => {
    const thread_id = sessionStorage.getItem(THREAD_KEY)
    return api.post('/ai/chat/confirm', { thread_id, confirm }, { timeout: CHAT_TIMEOUT }).then(fromChat)
  },
  // start a fresh conversation
  reset: () => sessionStorage.removeItem(THREAD_KEY),
  menu: (params) => isMock('ai.menu') ? mock(mockMenu(params), 700) : api.post('/ai/menu', params),
  cuisines: knownCuisines,
}
