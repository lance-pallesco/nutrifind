# NutriFind data model

## Prisma model proposal

```prisma
enum SubscriptionState {
  INACTIVE
  ACTIVE
  PAST_DUE
  CANCELED
}

model User {
  id               String         @id @default(cuid())
  email            String         @unique
  stripeCustomerId String?        @unique
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  searches         Search[]
  subscriptions    Subscription[]
}

model Search {
  id          String   @id @default(cuid())
  userId      String
  term        String   @db.VarChar(100)
  locale      String   @db.VarChar(2)
  resultCount Int      @default(0)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model Subscription {
  id                   String            @id @default(cuid())
  userId               String
  stripeSubscriptionId String            @unique
  stripePriceId        String
  state                SubscriptionState @default(INACTIVE)
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean           @default(false)
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
  user                 User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, state])
}

model StripeEvent {
  id          String   @id // Stripe event ID; idempotency key
  type        String
  processedAt DateTime @default(now())
}
```

`StripeEvent` is recommended even for a one-user demo because Stripe retries deliveries. A unique event ID makes replay safe and is easier to explain than relying on timing or status checks alone.

## Entitlement rule

```text
canViewNutrition = a subscription for the user exists with state ACTIVE
                   and its current period is not demonstrably expired
```

The webhook updates the local state. For an important billing action, the backend may re-fetch Stripe; the UI never grants access based on a successful Checkout redirect.

## Search retention

Store only the normalized search term, locale, count, user relation, and timestamp. Do not persist complete upstream product payloads in the first version. This keeps the MySQL schema small and avoids stale/copyright/data-quality issues.

## Migration and seed requirements

- Commit the generated initial migration under `prisma/migrations`.
- Seed exactly one demo user with a documented email.
- Never seed real Stripe IDs or secrets.
- Make seed idempotent with `upsert`.

