# NutriFind

NutriFind is a full-stack food product search demo. Users can search packaged foods through Open Food Facts, switch between English, Dutch, German, and French, and unlock detailed nutrition through a monthly Stripe subscription.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn theme
- Express 5 and TypeScript
- Prisma 6 with MySQL
- Open Food Facts product search
- Stripe Checkout and subscription webhooks
- Vitest and Supertest

## Local setup

Prerequisites: Node.js 20 or 22 LTS, npm, MySQL, and the Stripe CLI for webhook testing.

Copy the example environment file:

~~~bash
Copy-Item .env.example .env
~~~

Set these values in .env:

~~~env
DATABASE_URL=mysql://root:password@localhost:3306/nutrifind
SESSION_SECRET=at-least-32-random-characters
WEB_ORIGIN=http://localhost:3000
WEB_ORIGINS=http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:4000
~~~

Install dependencies, generate Prisma Client, apply the migration, and seed the demo user:

~~~bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
~~~

Run the API and web app in separate terminals:

~~~bash
npm run api:start
npm run dev
~~~

The web app is normally available at http://localhost:3000 and the API at http://localhost:4000. If Next.js uses port 3001, keep that origin in WEB_ORIGINS.

## Stripe test mode

Create a product with a recurring monthly price in Stripe Test mode. Copy its `price_` identifier into `STRIPE_PRICE_ID`. Add your `sk_test_` key as `STRIPE_SECRET_KEY`.

Forward local webhooks:

~~~bash
stripe login
stripe listen --forward-to localhost:4000/api/billing/webhook
~~~

Copy the `whsec_` value printed by the CLI into `STRIPE_WEBHOOK_SECRET`. Complete Checkout with Stripe test card `4242 4242 4242 4242`, any future expiry, any three-digit CVC, and a valid postal code.

The UI returns from Checkout with a processing message and polls the backend entitlement for a short period while Stripe delivers the webhook. The backend remains the source of truth.

## Commands

~~~bash
npm run api:start
npm run api:dev
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
~~~

## Architecture

The browser talks to the Next.js presentation layer and Express API. Express owns Open Food Facts calls, search persistence, Stripe SDK usage, webhook verification, and nutrition authorization. Product data is mapped into internal DTOs so UI code does not depend on provider field names.

See:

- [Project plan](docs/PROJECT_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API contract](docs/API_CONTRACT.md)
- [Data model](docs/DATA_MODEL.md)
- [Technical decisions](docs/TECHNICAL_DECISIONS.md)
- [Testing strategy](docs/TESTING_STRATEGY.md)

## Internationalization

UI messages are typed dictionaries for English, Dutch, German, and French. Open Food Facts product names use the selected-language field first, followed by generic and other supported-language fields. Missing values remain explicit rather than being presented as false zeros.

## Known limitations

- The demo uses one seeded user and a signed demo cookie instead of production authentication.
- Open Food Facts data quality and language coverage vary by product.
- Full-text search uses the legacy Open Food Facts search endpoint because the newer v2/v3 server APIs do not currently provide equivalent full-text search.
- Subscription access depends on webhook delivery and can briefly lag after Checkout.
- Rate limiting is application-instance scoped and is not distributed infrastructure.

