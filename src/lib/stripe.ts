import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
  }
  return stripeInstance;
}

export const STRIPE_PLANS = {
  free: {
    name: "Free",
    scrapeLimit: 50,
    priceId: null,
  },
  pro: {
    name: "Pro",
    scrapeLimit: Infinity,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
} as const;
