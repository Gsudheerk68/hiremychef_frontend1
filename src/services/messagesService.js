import api, { isMock, mock } from '../api/client'
import { db, save, nextId } from '../data/mockDb'
/**
 * A conversation is always between one customer and one chef.
 * ctx = { role, userId, chefId }. Thread shape: { id, customer_id, chef_id, name, last, at, unread, messages:[{id, mine, content, at}] }
 */
export const messagesService = {
  threads: (ctx) => {
    if (!isMock('messages')) return api.get('/messages').then((r) => r.items || r)
    const isChef = ctx.role === 'chef', map = new Map()
    db().messages.filter((m) => (isChef ? m.chef_id === ctx.chefId : m.customer_id === ctx.userId))
      .sort((a, b) => new Date(a.at) - new Date(b.at)).forEach((m) => {
        const key = `${m.customer_id}-${m.chef_id}`
        const t = map.get(key) || { id: key, customer_id: m.customer_id, chef_id: m.chef_id, name: isChef ? m.customer_name : m.chef_name, messages: [] }
        t.messages.push({ id: m.id, mine: isChef ? m.sender === 'chef' : m.sender === 'customer', content: m.content, at: m.at }); map.set(key, t)
      })
    return mock([...map.values()].map((t) => ({ ...t, last: t.messages.at(-1).content, at: t.messages.at(-1).at })).sort((a, b) => new Date(b.at) - new Date(a.at)))
  },
  /** to = { customer_id, chef_id, customer_name, chef_name } */
  send: ({ to, content }, ctx) => {
    if (!isMock('messages')) return api.post('/messages', { customer_id: to.customer_id, chef_id: to.chef_id, content })
    const m = { id: nextId(), ...to, sender: ctx.role === 'chef' ? 'chef' : 'customer', content, at: new Date().toISOString() }
    db().messages.push(m); save(); return mock(m, 150)
  },
}
