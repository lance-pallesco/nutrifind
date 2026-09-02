# NutriFind API contract

All endpoints are served by Express under `/api`. JSON is used except for the Stripe webhook request body, which must remain raw until signature verification.

## Shared types

```ts
type Locale = "en" | "nl" | "de" | "fr";
type SubscriptionState = "inactive" | "active" | "past_due" | "canceled";

type ProductSummary = {
  code: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
  nutrition: Nutrition | null; // omitted or null when locked
};

type Nutrition = {
  energyKcal100g: number | null;
  fat100g: number | null;
  saturatedFat100g: number | null;
  carbohydrates100g: number | null;
  sugars100g: number | null;
  fiber100g: number | null;
  proteins100g: number | null;
  salt100g: number | null;
  novaGroup: number | null;
};
```

## `GET /api/health`

Returns `{ "status": "ok" }`. It should not require the database to be healthy if the purpose is process liveness; add a separate readiness check if deployment needs dependency health.

## `GET /api/products/search?q=...&lang=...`

Requirements:

- `q`: required, trimmed, 2–100 characters.
- `lang`: optional; defaults to `en`, accepts only the four supported locales.
- Result limit is server-controlled, for example 12.

Response:

```json
{
  "query": "chocolate",
  "locale": "en",
  "canViewNutrition": false,
  "products": [
    {
      "code": "123",
      "name": "Example Chocolate",
      "brand": "Example",
      "imageUrl": "https://images.openfoodfacts.org/...",
      "quantity": "100 g",
      "nutrition": null
    }
  ]
}
```

The API is the authorization boundary. For inactive users, do not serialize nutrition values at all; `null` is shown above as a simple contract representation, but omitting the field is preferable for preventing accidental leakage.

## `GET /api/searches/recent?limit=...`

Returns the latest distinct or latest chronological searches for the demo user. The implementation should choose one policy and document it; latest chronological searches with a limit of 10 is simplest for the demo.

```json
{
  "searches": [
    { "id": "...", "term": "chocolate", "locale": "en", "resultCount": 12, "createdAt": "2026-09-02T10:00:00.000Z" }
  ]
}
```

## `GET /api/me`

Returns the demo user's safe identity and current entitlement:

```json
{
  "user": { "id": "...", "email": "demo@example.com" },
  "subscription": { "state": "active", "currentPeriodEnd": "2026-10-02T00:00:00.000Z" },
  "canViewNutrition": true
}
```

## `POST /api/billing/checkout-session`

Creates a Stripe-hosted monthly Checkout Session for the demo user. The server selects the price ID from configuration; the client cannot supply an arbitrary price.

Response: `{ "url": "https://checkout.stripe.com/..." }`.

The route should return `409` or a safe existing-management response if an active subscription already exists.

## `POST /api/billing/webhook`

Stripe calls this route with the raw request body and `Stripe-Signature` header. It returns `200` after a verified event is safely handled, including a recognized no-op. Invalid signatures return `400`; transient database failures return `500` so Stripe retries.

## Status codes

- `400`: invalid query, locale, JSON, or signature.
- `401`: missing/invalid demo session.
- `402`: optional product response for a locked premium action; search itself remains public/basic.
- `404`: unknown resource.
- `409`: conflicting subscription state.
- `429`: rate limit exceeded.
- `502`: Open Food Facts unavailable or malformed.
- `500`: unexpected internal failure.

