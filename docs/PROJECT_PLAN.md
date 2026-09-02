# NutriFind implementation plan

## 1. Product outcome

NutriFind is a small, responsive product search application with one seeded demo user. A visitor can search packaged foods, view basic product information, switch between English, Dutch, German, and French, and inspect detailed nutrition only when the demo user has an active Stripe subscription.

The implementation should optimize for a clear technical review: small boundaries, typed contracts, deterministic authorization, explicit fallbacks for incomplete Open Food Facts data, and tests around the highest-risk integrations.

## 2. Scope and non-goals

### In scope

- Search Open Food Facts by a free-text title or term.
- Render product name, brand, image, and a safe empty state when fields are missing.
- Render nutrition values only for an active subscription.
- Store the demo user's recent searches in MySQL through Prisma.
- Start a monthly Stripe Checkout subscription in test mode.
- Process Stripe subscription webhooks idempotently.
- Manually select `en`, `nl`, `de`, or `fr`.
- Localize UI labels and select the best available Open Food Facts language field.
- Automated unit, API, integration, and component tests for meaningful behavior.

### Deliberate simplifications

- There is one pre-seeded demo user; no registration, password reset, or multi-user account UI.
- A signed, HTTP-only demo session cookie identifies that user. It is still validated in the API; the client never decides subscription access.
- Search results are read from Open Food Facts on demand. Product catalog synchronization, favorites, pagination UI, and administrative tooling are out of scope.
- Stripe Customer Portal is out of scope; the demo only needs Checkout and webhook-driven entitlement updates.
- Product translations are not machine-translated. The app uses OFF's localized fields and falls back to the product's default name, then a neutral placeholder.

## 3. Recommended delivery sequence

### Phase 0 — Baseline and decisions

1. Preserve the existing Next.js 16 App Router, Shadcn preset theme, Manrope, and Geist font configuration.
2. Confirm the package manager and Node version in the repository.
3. Add a workspace layout without moving UI code until the first vertical slice is understood.
4. Add `.env.example`, runtime configuration validation, lint/typecheck/test scripts, and a local MySQL development setup.

### Phase 1 — Backend foundation

1. Add an `apps/api` Express TypeScript service.
2. Add Prisma schema and an initial migration for `User`, `Search`, and `Subscription`.
3. Add a Prisma client singleton and a seed script for the demo user.
4. Add request validation, consistent error responses, request IDs, and a health endpoint.
5. Add the demo session middleware and an `activeSubscription` authorization helper.

### Phase 2 — Open Food Facts vertical slice

1. Implement an `OpenFoodFactsClient` behind an interface.
2. Map the OFF response into an internal `ProductSummary` DTO; do not expose the provider response directly.
3. Add a search service that trims and validates input, calls OFF, normalizes incomplete data, and records the search.
4. Add `GET /api/products/search?q=...&lang=...` and `GET /api/searches/recent`.
5. Cover provider mapping, timeout/error behavior, language fallback, and recent-search persistence.

### Phase 3 — Frontend experience

1. Replace the starter page with a server-rendered shell and focused client components for search, language selection, and subscription actions.
2. Keep the API base URL and all secret-bearing operations on the server boundary.
3. Build responsive states: empty, loading, results, no results, provider failure, incomplete product, locked nutrition, and unlocked nutrition.
4. Add accessible labels, keyboard behavior, image fallbacks, and responsive cards/grid.
5. Use URL query parameters (`q` and `lang`) so a search is shareable and refresh-safe.

### Phase 4 — Stripe subscription slice

1. Add a Stripe service that creates a monthly Checkout Session for the seeded user.
2. Add `POST /api/billing/checkout-session` and return only the Checkout URL/session identifier needed by the UI.
3. Add `POST /api/billing/webhook` with raw request bytes before JSON parsing.
4. Handle `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
5. Make event processing idempotent and map Stripe statuses to the app's entitlement state.
6. Re-fetch current Stripe subscription state where appropriate rather than trusting a stale client redirect.

### Phase 5 — Hardening and handoff

1. Add tests for authorization at the API boundary, not only in UI conditionals.
2. Run migration, seed, lint, typecheck, unit tests, API tests, and a production build.
3. Verify webhook events locally with Stripe CLI and document the command.
4. Add security, accessibility, and responsive QA notes to the README.
5. Document known limitations and a short demo script for reviewers.

## 4. Definition of done

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- A fresh MySQL database can be migrated and seeded from documented commands.
- Search never sends an Open Food Facts API key or Stripe secret to the browser.
- The backend strips nutrition fields for inactive users, even if a caller manipulates the frontend.
- Replaying the same Stripe event does not create duplicate subscription records or corrupt status.
- All four languages have complete UI copy for the primary flow.
- Missing image, brand, name, and nutrition values have visible, localized fallbacks.
- README setup steps work for a reviewer starting with `.env.example`.

## 5. Reviewer demo script

1. Start MySQL, migrate, seed, start the API, and start Next.js.
2. Search for `chocolate` in English and show recent searches.
3. Switch to Dutch, German, and French; show localized UI and the best available product title.
4. Show basic results while logged in as the demo user; nutrition is locked.
5. Start Stripe Checkout in test mode and complete it with a Stripe test card.
6. Forward the webhook with Stripe CLI, refresh entitlement, and show nutrition values.
7. Replay the webhook or send a canceled-subscription event and show that nutrition becomes locked again.

