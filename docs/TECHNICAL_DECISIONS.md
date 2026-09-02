# Technical decisions and trade-offs

## Next.js and Express split

Next.js remains a focused web application using App Router server components where possible. Express owns backend concerns required by the assignment: external API orchestration, persistence, Stripe SDK usage, webhook parsing, and entitlement enforcement. This adds a second process, but makes the required architecture explicit and prevents a hidden dependency on Next route handlers.

## Provider adapter and DTO mapping

Open Food Facts is treated as an unreliable external boundary. An adapter owns URL construction, headers, timeout, response validation, and provider-specific field names. A mapper creates an internal DTO with nullable fields. UI components never depend on raw OFF keys such as `product_name_en` or `nutriments.energy-kcal_100g`.

## Internationalization

UI copy lives in four typed dictionaries, keyed by stable message IDs. The locale is validated against `en`, `nl`, `de`, and `fr`; unsupported input falls back to English. Product text uses this ordered strategy:

1. Open Food Facts field for the selected language, for example `product_name_nl`.
2. The generic product name from OFF.
3. The first non-empty supported-language name if available.
4. A localized “name unavailable” label.

Brands, quantities, and nutrition values are not translated by the application. Values are formatted with `Intl.NumberFormat(locale)` and labels are localized. This is honest about the source data and avoids inventing translations.

## Subscription authorization

The frontend displays subscription state for usability, but the backend decides access on every protected response. Nutrition is omitted for inactive users. Stripe webhook processing is the normal state update path; event IDs are persisted for idempotency.

## Demo authentication

The assignment asks for one demo user, not a full identity system. Use a signed HTTP-only cookie containing the seeded user ID, with `SameSite=Lax`, `Secure` in production, and a configurable signing secret. Keep the middleware behind an interface so real authentication can replace it later. Do not accept a user ID from request JSON or query parameters.

## Image handling

Use `next/image` only after configuring the OFF image host in `next.config.ts`, or use a regular `<img>` with explicit dimensions if the host configuration is not appropriate. Always render a neutral placeholder when the URL is absent or the image fails. Product image URLs are external and should be treated as untrusted display data.

## Caching and rate limits

Do not cache personalized API responses or nutrition entitlement decisions. A short server-side cache for identical public OFF searches can be added later. Add a modest IP/user rate limit to the search route to avoid accidental upstream abuse; document that this is demo-grade and not distributed-rate-limit infrastructure.

## Secrets

Keep `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `SESSION_SECRET`, and internal API URLs in environment variables. Only a deliberately public web configuration may use `NEXT_PUBLIC_`. Validate required server variables at process startup and provide placeholders in `.env.example`, never real values.

## Known limitations

- OFF data quality and language coverage vary by product and country.
- The demo session is not production authentication.
- A single API instance and local MySQL are sufficient for the test but do not address horizontal scaling or distributed rate limiting.
- Subscription state can briefly lag until the webhook is delivered.
- No product catalog cache means search availability depends on OFF availability.

