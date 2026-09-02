# NutriFind architecture

## 1. System shape

```text
Browser
  |
  | HTTPS / JSON, demo session cookie
  v
Next.js 16 web app (App Router + React + Tailwind + Shadcn)
  |
  | server-side API calls; no provider secrets in browser
  v
Express API (TypeScript)
  |-- Search application service ----> Open Food Facts API
  |-- Subscription application service -> Stripe API
  |-- Prisma repositories -----------> MySQL
  `-- Stripe webhook route <--------- Stripe events
```

Next.js is the presentation layer. Express is the system of record for search persistence and subscription authorization. This is intentionally a two-process application because Express is an explicit requirement and Stripe webhook signature verification needs a dedicated, predictable HTTP boundary.

## 2. Proposed repository structure

The current repository is a minimal Next starter. Evolve it into the following small workspace while retaining the existing root-level Next app during the first migration step, or move it to `apps/web` once the workspace scripts are stable.

```text
.
├─ apps/
│  ├─ web/                         # Next.js App Router
│  │  ├─ app/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  └─ error.tsx
│  │  ├─ components/
│  │  │  ├─ product-search.tsx     # client: form/query interaction
│  │  │  ├─ product-card.tsx
│  │  │  ├─ nutrition-panel.tsx
│  │  │  ├─ language-selector.tsx
│  │  │  └─ subscription-cta.tsx
│  │  ├─ features/products/
│  │  ├─ features/billing/
│  │  ├─ lib/api-client.ts         # typed browser/server API wrapper
│  │  └─ lib/i18n/                 # dictionaries and locale helpers
│  └─ api/                         # Express service
│     └─ src/
│        ├─ server.ts
│        ├─ app.ts
│        ├─ config/env.ts
│        ├─ middleware/
│        ├─ modules/products/
│        │  ├─ products.routes.ts
│        │  ├─ products.controller.ts
│        │  ├─ products.service.ts
│        │  ├─ open-food-facts.client.ts
│        │  └─ products.mapper.ts
│        ├─ modules/billing/
│        │  ├─ billing.routes.ts
│        │  ├─ billing.controller.ts
│        │  ├─ billing.service.ts
│        │  └─ stripe.webhook.ts
│        ├─ modules/searches/
│        ├─ modules/users/
│        └─ shared/
│           ├─ errors/
│           ├─ http/
│           └─ types/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ packages/
│  └─ contracts/                   # optional shared DTOs/Zod schemas
├─ tests/
│  ├─ unit/
│  ├─ api/
│  └─ e2e/
├─ .env.example
└─ README.md
```

If a full workspace adds too much setup for the test, the equivalent is `app/` for web, `server/` for Express, `prisma/` at the root, and `lib/` for shared types. The important rule is that provider clients, Prisma, and Stripe remain outside client component imports.

## 3. Request responsibilities

### Search

1. The browser submits a normalized query and selected locale.
2. Next.js calls Express using the demo session cookie.
3. Express validates query length and locale.
4. `ProductsService` invokes `OpenFoodFactsClient` with a timeout and a bounded result size.
5. `ProductsMapper` converts provider data to stable internal DTOs and resolves localized fields.
6. `SearchesRepository` stores the term, locale, result count, and timestamp for the demo user.
7. Express returns public product data plus nutrition only when `canViewNutrition` is true.

### Subscription

1. The browser requests a Checkout Session from Express.
2. Express loads the demo user and creates a Stripe monthly subscription Checkout Session.
3. The browser redirects to Stripe-hosted Checkout.
4. Stripe sends signed events to the webhook route.
5. The route verifies the signature against the raw body and passes the event to the billing service.
6. The billing service upserts the subscription and records the processed event ID.
7. Product responses calculate access from the stored subscription state; the browser redirect is not proof of payment.

## 4. Frontend rendering boundaries

- Server components: page shell, initial entitlement/recent-search fetch, metadata, and static content.
- Client components: search form, language selector, loading transitions, Checkout redirect, and dismissible notices.
- Keep the client boundary narrow. Do not mark the whole page or layout as client code merely to support one interactive form.
- Set `<html lang>` from the selected locale when the locale is represented in the route; otherwise keep the persisted locale in a client provider and update the document language carefully.

## 5. Error and observability policy

Use one JSON error shape:

```json
{
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "Product search is temporarily unavailable.",
    "requestId": "req_123"
  }
}
```

Expose friendly messages to users, but log provider/Stripe error details server-side with a request ID. Never log cookies, authorization headers, Stripe signatures, card data, or full upstream payloads.

