import api, { isMock, mock, TOKEN_KEY } from '../api/client'
import { chefsService } from './chefsService'
import { menuFor, knownCuisines } from '../data/menus'
import { estimatePrice } from '../utils/pricing'

const CUISINE_WORDS = { 'south indian':'South Indian', andhra:'Andhra', mughlai:'Mughlai', biryani:'Biryani', italian:'Italian', continental:'Continental', veg:'Vegetarian', vegetarian:'Vegetarian', bbq:'BBQ', grill:'BBQ', party:'Party Catering', kerala:'Kerala', seafood:'Seafood', fish:'Seafood' }
const CITIES = ['Nellore', 'Hyderabad', 'Bengaluru', 'Vijayawada', 'Chennai', 'Visakhapatnam', 'Tirupati']

const THREAD_KEY = 'hmc_chat_thread'   // server-side conversation id
const CHAT_KEY = 'hmc_chat_state'      // messages shown on screen, so the chat survives leaving the page
const CHAT_TIMEOUT = 300000            // non-streaming calls: local LLMs on CPU can take a few minutes
// the saved chat belongs to one login: a different login (new token) starts clean
const chatOwner = () => (localStorage.getItem(TOKEN_KEY) || '').slice(-16)

/** Very small rule-based stand-in used in mock mode (no backend): it extracts cuisine, city, budget and guests
 *  from the text, then scores every chef. */
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

/** Maps the backend chat response to what the page renders. */
function fromChat(res) {
  if (res.thread_id) sessionStorage.setItem(THREAD_KEY, res.thread_id)
  return { reply: res.reply, chefs: res.chefs || [], pending: res.pending_confirmation || null, rankedBy: res.ranked_by || null }
}

/** Reads a Server-Sent Events response and yields { event, data } objects. */
async function* readSSE(res) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let i
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, i)
      buf = buf.slice(i + 2)
      let event = 'message'
      let data = ''
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5).trim()
      }
      if (data) yield { event, data: JSON.parse(data) }
    }
  }
}

/** POSTs to a streaming endpoint, calls on(event, data) for every event, resolves with the final result. */
async function streamPost(path, body, on) {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${api.defaults.baseURL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); window.dispatchEvent(new Event('hmc:unauthorized')) }
  if (!res.ok) {
    let message = 'Something went wrong'
    try { const d = await res.json(); if (typeof d.detail === 'string') message = d.detail } catch { /* not JSON */ }
    throw { status: res.status, message }
  }
  let final = null
  for await (const ev of readSSE(res)) {
    if (ev.event === 'error') throw { status: ev.data.status, message: ev.data.message }
    if (ev.event === 'done') final = ev.data
    on?.(ev.event, ev.data)
  }
  if (!final) throw { message: 'The connection was interrupted. Please try again.' }
  return fromChat(final)
}

/** Mock mode: replays a ready answer word by word so the UI behaves the same without a backend. */
async function mockStream(r, on) {
  on?.('status', { text: 'Thinking…' })
  for (const w of r.reply.split(' ')) {
    on?.('token', { text: `${w} ` })
    await new Promise((res) => setTimeout(res, 25))
  }
  return { reply: r.reply, chefs: r.chefs, pending: null, rankedBy: null }
}

export const aiService = {
  // one-shot JSON versions (kept for tests and as a fallback)
  chat: (message) => {
    if (isMock('ai.chat')) return mockChat(message).then((r) => mock(r, 600))
    const thread_id = sessionStorage.getItem(THREAD_KEY) || undefined
    return api.post('/ai/chat', { message, thread_id }, { timeout: CHAT_TIMEOUT }).then(fromChat)
  },
  confirm: (confirm) => {
    const thread_id = sessionStorage.getItem(THREAD_KEY)
    return api.post('/ai/chat/confirm', { thread_id, confirm }, { timeout: CHAT_TIMEOUT }).then(fromChat)
  },

  // streaming versions (Server-Sent Events): on(event, data) is called as the reply is produced
  chatStream: async (message, on) => {
    if (isMock('ai.chat')) return mockStream(await mockChat(message), on)
    const thread_id = sessionStorage.getItem(THREAD_KEY) || undefined
    return streamPost('/ai/chat/stream', { message, thread_id }, on)
  },
  confirmStream: (confirm, on) =>
    streamPost('/ai/chat/confirm/stream', { thread_id: sessionStorage.getItem(THREAD_KEY), confirm }, on),

  // keep the on-screen chat when the user leaves the page and comes back (this tab, this login only)
  loadChat: () => {
    try {
      const s = JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null')
      return s && s.owner === chatOwner() ? s : null
    } catch { return null }
  },
  saveChat: (msgs, pending) => {
    try { sessionStorage.setItem(CHAT_KEY, JSON.stringify({ owner: chatOwner(), msgs, pending })) } catch { /* storage blocked or full */ }
  },
  reset: () => { sessionStorage.removeItem(THREAD_KEY); sessionStorage.removeItem(CHAT_KEY) },

  menu: (params) => isMock('ai.menu') ? mock(mockMenu(params), 700) : api.post('/ai/menu', params),
  cuisines: knownCuisines,
}
