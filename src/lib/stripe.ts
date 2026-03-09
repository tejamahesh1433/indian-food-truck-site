import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_please_update_in_env";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing from .env. Checkout will fail until a real key is provided.");
}

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any, // Standard stable version or the one intended
});
