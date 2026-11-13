# Hire My Chef – Frontend (React + Vite + Tailwind)

Complete frontend for the platform: public site, chef discovery, booking, and the customer, chef and admin dashboards.

## What is in it
| Area | Pages |
|---|---|
| Public | Landing, **Explore Chefs** (search, filters, sort, pagination), **Chef Details** (menus, certifications, reviews, availability calendar), How it Works, About, FAQ, Contact |
| Auth | Login, Register (customer / chef), Forgot + Reset password |
| Customer `/customer` | Overview, **Book a chef** (live price estimate), My bookings (cancel, review), Favourites, Messages, **AI assistant** (chef finder + menu planner), Account |
| Chef `/chef` | Overview, Booking requests (accept / decline / complete), **Availability calendar** (block / open days), Profile editor with live preview, Earnings chart, Reviews, Messages |
| Admin `/admin` | Overview (stat cards + charts), **Chef approvals** (approve / revoke), Users, Bookings |

Tech: React 18, Vite 5, Tailwind 3, React Router 6, Axios, Recharts, Lucide, Framer Motion. Dashboards are lazy-loaded.

## Run
    npm install
    cp .env.example .env
    npm run dev          # http://localhost:5173

## Three data modes (`VITE_USE_MOCK` in `.env`)
| Value | Behaviour |
|---|---|
| `true` (default) | No backend needed. Mock data is kept in localStorage, so a booking made as a customer shows up for the chef and the admin. |
| `hybrid` | **Use this with your current backend (Phase 3).** Auth, chefs, search, availability, chef profile edits, admin approval and the user list hit FastAPI. Bookings, reviews, messages, favourites and AI use mock data. |
| `false` | Everything calls the backend. Use once Phases 4-6 exist. Expected endpoints are listed in `API_CONTRACT.md`. |

### Trying hybrid mode with the backend
    # backend
    python -m scripts.seed_demo                                   # chef1@demo.com … chef6@demo.com / ChefPass123
    python -m scripts.create_admin admin@demo.com "Admin" AdminPass123
    uvicorn app.main:app --reload
    # frontend: set VITE_USE_MOCK=hybrid in .env, then npm run dev
Flow to try: register as a chef → see the "awaiting approval" banner → log in as admin → approve → the chef appears in Explore.

### Mock-mode logins
Any email and a password of 6+ characters works. Pick the role on the login screen (customer, chef or admin). In mock mode every chef login is "Ravi Kumar" (chef id 1). To reset mock data, run `localStorage.removeItem('hmc_mockdb_v1')` in the browser console.

## How it fits together
1. `src/api/client.js` is the single Axios instance (Bearer token, 401 handling, readable FastAPI errors) and `isMock(domain)` decides mock vs real per feature.
2. `src/services/*Service.js` hold every API call and its mock twin. Pages never contain fake data.
3. `src/data/mockDb.js` is the localStorage mock database used by the mock side of each service.
4. `src/layouts/DashboardLayout.jsx` wraps all three dashboards (sidebar, mobile drawer) and loads the chef's own profile once for chef pages.
5. `ProtectedRoute` is a UI guard only. The backend enforces real permissions.

## Things to know
- **Price estimate** is a frontend formula in `src/utils/pricing.js` (base price covers 6 guests, +6% per extra guest, times an event-type factor). It is a placeholder rule I chose. When the backend exposes `POST /bookings/estimate`, the frontend uses its number automatically.
- **Sample menus** on chef pages (`src/data/menus.js`) and the **AI assistant** in mock/hybrid mode are rule-based stand-ins, not machine learning. The AI mock ranks real chefs by cuisine, city, budget and availability. The Phase 6 endpoints should return the same shape.
- Bug fixed from Stage 2: the admin service called `/admin/chefs/{id}/approve`; the backend route is `/verify`. The landing "BBQ & Grill" cuisine is now "BBQ" so the filter matches chef data.
- Hybrid-mode caveat: accepted mock bookings do not yet block dates in the real availability API (that arrives with backend Phase 4).
- Account editing (name, phone) is read-only until the backend has a profile-update endpoint.

## Verified
`npm run build` is clean. Browser tests (Playwright) passed 26/26 in mock mode and 22/22 in hybrid mode against the real FastAPI backend, with zero console errors.
