import type Stripe from "stripe";
import { prisma } from "../../db/prisma";
import { AppError } from "../../middleware/error-handler";

function stateFor(status: Stripe.Subscription.Status) {
  if (status === "active" || status === "trialing") return "ACTIVE" as const;
  if (status === "past_due" || status === "unpaid") return "PAST_DUE" as const;
  if (status === "canceled" || status === "incomplete_expired") return "CANCELED" as const;
  return "INACTIVE" as const;
}

export async function upsertStripeSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId }, select: { id: true } });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "Stripe customer is not linked to a demo user.");

  const priceId = subscription.items.data[0]?.price.id ?? "unknown";
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      userId: user.id,
      stripePriceId: priceId,
      state: stateFor(subscription.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      state: stateFor(subscription.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}
