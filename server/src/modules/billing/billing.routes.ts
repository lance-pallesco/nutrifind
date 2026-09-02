import { Router } from "express";
import type Stripe from "stripe";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { optionalDemoSession } from "../../middleware/demo-session";
import { AppError } from "../../middleware/error-handler";
import { getStripe, requireStripeConfig } from "./stripe.client";
import { upsertStripeSubscription } from "./billing.service";

export const billingRouter = Router();
export const stripeWebhookRouter = Router();

billingRouter.post("/checkout-session", optionalDemoSession, async (req, res, next) => {
  try {
    requireStripeConfig();
    if (!req.demoUser) throw new AppError(401, "UNAUTHENTICATED", "Demo session required.");

    const active = await prisma.subscription.findFirst({
      where: { userId: req.demoUser.id, state: "ACTIVE" },
      select: { id: true },
    });
    if (active) throw new AppError(409, "ALREADY_SUBSCRIBED", "The demo user already has an active subscription.");

    const stripe = getStripe();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.demoUser.id } });
    const customer = user.stripeCustomerId
      ? user.stripeCustomerId
      : (await stripe.customers.create({ email: user.email, metadata: { userId: user.id } })).id;
    if (!user.stripeCustomerId) {
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price: env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: env.WEB_ORIGIN + "?checkout=success",
      cancel_url: env.WEB_ORIGIN + "?checkout=cancelled",
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
    });
    if (!session.url) throw new AppError(502, "CHECKOUT_URL_MISSING", "Stripe did not return a Checkout URL.");
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

stripeWebhookRouter.post("/", async (req, res, next) => {
  try {
    requireStripeConfig();
    const signature = req.header("stripe-signature");
    if (!signature || !Buffer.isBuffer(req.body)) {
      throw new AppError(400, "INVALID_WEBHOOK", "Invalid Stripe webhook request.");
    }
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      throw new AppError(400, "INVALID_WEBHOOK_SIGNATURE", "Invalid Stripe webhook signature.");
    }

    const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) {
      res.json({ received: true, duplicate: true });
      return;
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (customerId && session.metadata?.userId) {
        await prisma.user.update({ where: { id: session.metadata.userId }, data: { stripeCustomerId: customerId } });
      }
    }
    if (event.type.startsWith("customer.subscription.")) {
      await upsertStripeSubscription(event.data.object as Stripe.Subscription);
    }
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});
