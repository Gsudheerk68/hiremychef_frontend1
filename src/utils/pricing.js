// Client-side estimate. The booking backend (Phase 4) is the source of truth; this mirrors a simple rule
// so the customer sees a figure while filling the form: base price covers 6 guests, +6% per extra guest,
// multiplied by an event-type factor.
export const SERVICES = [
  { name:'Family dinner', factor:1 }, { name:'Weekly meals', factor:.9 }, { name:'Birthday party', factor:1.15 },
  { name:'Festival / Pooja', factor:1.1 }, { name:'Corporate event', factor:1.3 }, { name:'Wedding / Reception', factor:1.5 },
]
export const INCLUDED_GUESTS = 6
export function estimatePrice(basePrice, guests, service) {
  const base = Number(basePrice) || 0, g = Math.max(1, Number(guests) || 1)
  const factor = SERVICES.find((s) => s.name === service)?.factor ?? 1
  const extraGuests = Math.max(0, g - INCLUDED_GUESTS), extraCost = Math.round(base * 0.06 * extraGuests)
  const total = Math.round(((base + extraCost) * factor) / 50) * 50
  return { base, extraGuests, extraCost, factor, total }
}
