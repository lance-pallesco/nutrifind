# NutriFind testing strategy

## Test layers

### Unit tests

Keep pure logic easy to test without a database or network:

- locale validation and English fallback;
- Open Food Facts product-name selection;
- nutrition field normalization and number handling;
- product DTO mapping for complete and incomplete payloads;
- Stripe status-to-entitlement mapping;
- request query validation;
- entitlement calculation.

### API tests

Use an in-memory Express app with dependency injection:

- valid search returns mapped products and stores a search;
- blank, too-short, too-long, and invalid-locale queries return 400;
- Open Food Facts timeout/malformed response returns a safe 502;
- inactive users receive basic product fields without nutrition;
- active users receive nutrition values;
- recent searches are scoped to the authenticated demo user;
- Checkout uses the configured price and server-side user;
- invalid Stripe webhook signatures return 400.

### Integration tests

Use a disposable MySQL database or a test database configured through .env.test:

- Prisma migration succeeds from an empty schema;
- seed is idempotent;
- search persistence has the expected user relation and index behavior;
- the same Stripe event ID can be processed twice without duplicate state;
- subscription cancellation removes nutrition access.

### Browser/component tests

Use Playwright or the repository's chosen browser runner for the most important user paths:

- search form and loading/no-results/error states;
- switching all four locales changes UI copy;
- missing product image renders the placeholder;
- locked nutrition shows an upgrade CTA;
- unlocked nutrition renders localized numeric formatting;
- Checkout button redirects to the returned Stripe URL.

## Mocking policy

- Mock Open Food Facts at the client interface or HTTP boundary; tests must not depend on live provider data.
- Mock Stripe SDK calls and construct signed webhook fixtures in unit/API tests.
- Keep one optional manual smoke test against Stripe test mode and the real OFF endpoint documented in the README.
- Prefer dependency injection over module-global mocks so tests show which integration each service uses.

## Test fixtures

Create small fixtures for:

1. a complete multilingual product;
2. a product with only a generic name and no image;
3. a product with missing nutriments;
4. an OFF response with no products;
5. active, past-due, and canceled subscriptions;
6. duplicate and unknown Stripe events.

## Test commands

Document the final commands once tooling is installed:

~~~bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:e2e
npm run build
~~~

The CI order should run fast static/unit checks first, then integration/browser tests that need services.

