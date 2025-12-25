import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-11-17.clover";

let cachedStripeClient: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (cachedStripeClient) {
    return cachedStripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  cachedStripeClient = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });

  return cachedStripeClient;
};
