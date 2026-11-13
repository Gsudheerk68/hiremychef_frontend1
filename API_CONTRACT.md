# Endpoints the frontend expects from backend Phases 4-6

Everything under `/api/v1`, JSON, Bearer token. Lists may be a plain array or `{ items: [...] }`.
Errors: `{ "detail": "message" }` (shown to the user as is). Already built in Phases 1-3 and used for real in `hybrid` mode: auth, `/chefs…`, `/admin/users`, `/admin/chefs…`.

## Bookings (Phase 4)
| Call | Notes |
|---|---|
| `GET /bookings` | Filtered by the token: a customer gets their own, a chef gets bookings for their profile. |
| `POST /bookings` | Body: `chef_id, service_type, event_date, guests, cuisine, location, notes, estimated_price`. `event_date` is sent as a local time without offset, e.g. `2026-12-25T19:00:00`. Return 409 if the chef is blocked or already has an accepted booking that day. The server should compute its own price and ignore `estimated_price`. |
| `POST /bookings/{id}/accept` · `reject` · `cancel` · `complete` | Allowed moves: Pending → Accepted / Rejected; Pending or Accepted → Cancelled; Accepted → Completed. Return 409 otherwise. |
| `POST /bookings/estimate` | Body `{chef_id, guests, service_type}` → `{ estimated_price }`. Optional: the frontend falls back to its own formula if missing. |
| `GET /admin/bookings` | Admin only. |

Booking object fields read by the UI: `id, customer_id, customer_name, chef_id, chef_name, chef_photo, service_type, event_date, guests, cuisine, location, notes, estimated_price, status` (`Pending|Accepted|Rejected|Completed|Cancelled`), `created_at`, `reviewed` (bool, true once a review exists). Nested `chef: {name, photo}` and `customer: {full_name}` are also understood.

Timezone note: availability compares `date(event_date)`. Pick one timezone (for example Asia/Kolkata) for storing and comparing, or an evening event could land on the next UTC day.

## Reviews (Phase 4)
- `GET /chefs/{id}/reviews` → `[ { id, customer_name, rating, comment, created_at } ]`
- `POST /reviews` body `{ booking_id, rating (1-5), comment }`. Only for the customer's own Completed booking, one per booking; update the chef's `rating` and `reviews` count.

## Messages (Phase 5)
- `GET /messages` → threads: `[ { id, customer_id, chef_id, name, last, at, messages: [ { id, mine, content, at } ] } ]` (`name` is the other person; `mine` is relative to the caller).
- `POST /messages` body `{ customer_id, chef_id, content }`.

## Customer (Phase 5)
- `GET /customers/me/favorites` → list of chef objects (same shape as `ChefOut`)
- `POST /customers/me/favorites/{chef_id}` · `DELETE /customers/me/favorites/{chef_id}`

## Admin (Phase 5)
Stats are composed in the browser from `/admin/users`, `/admin/chefs` and `/admin/bookings`, so no stats endpoint is needed.

## AI (Phase 6)
- `POST /ai/chat` body `{ message }` → `{ reply, chefs: [ { ...ChefOut, match (0-100), reason, estimate } ] }`
- `POST /ai/menu` body `{ cuisine, guests, diet (any|vegetarian|vegan|jain), budget }` → `{ title, diet, courses: [ { name, items: [] } ], estimated_cost_per_head, tips: [] }`
- `GET /chefs/recommended` already exists and is used on the landing page and customer overview.

## One small suggestion for `ChefOut`
It has no owner `user_id`. Not needed now, but useful if messages are keyed by user later.
