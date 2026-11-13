export const inr = (n) => '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN')
const dateOnly = (d) => (typeof d === 'string' && d.length === 10 ? d + 'T00:00:00' : d)
export const fmtDate = (d, o = {}) => d ? new Date(dateOnly(d)).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', ...o }) : ''
export const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit' }) : ''
export const fmtDateTime = (d) => d ? `${fmtDate(d)}, ${fmtTime(d)}` : ''
export const iso = (d) => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
export const todayISO = () => iso(new Date())
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const dayOf = (d) => (typeof d === 'string' ? d.slice(0, 10) : iso(d))
export const timeAgo = (d) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return fmtDate(d)
}
export const initials = (n = '') => n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
