/**
 * Free launch. Keep this false until in-app checkout should ship again.
 *
 * Turning payments on later requires all of:
 * 1. Set PAYMENTS_ENABLED to true here (the only in-app switch).
 * 2. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY on the EAS build profile.
 * 3. Set the Supabase secret PAYMENTS_ENABLED=true and a live STRIPE_SECRET_KEY.
 *
 * While this is false the client never reads a Stripe key and does not render checkout.
 */
export const PAYMENTS_ENABLED = false
