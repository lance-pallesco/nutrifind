import Stripe from "stripe";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error-handler";

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(503, "STRIPE_NOT_CONFIGURED", "Stripe is not configured.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export function requireStripeConfig() {
  if (!env.STRIPE_PRICE_ID || !env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(503, "STRIPE_NOT_CONFIGURED", "Stripe is not configured.");
  }
}
