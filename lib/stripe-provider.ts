import { type ReactNode } from 'react';

/**
 * 1.0.1: the Stripe native SDK is not bundled in the app binary while
 * PAYMENTS_ENABLED is false (see lib/features.ts). This keeps PassKit and the
 * Apple Pay entitlement out of the iOS build (App Review 11.10.2026).
 *
 * To ship checkout again: `npx expo install @stripe/stripe-react-native`, add its
 * config plugin back to app.json, and restore
 *   export { StripeProvider, useStripe } from '@stripe/stripe-react-native';
 */
export function StripeProvider({ children }: { children: ReactNode; publishableKey?: string }) {
  return children;
}

export function useStripe() {
  return {
    initPaymentSheet: async (_params?: unknown) => ({ error: { code: 'Disabled' as string, message: 'Payments are disabled in this version' } }),
    presentPaymentSheet: async () => ({ error: { code: 'Disabled' as string, message: 'Payments are disabled in this version' } }),
  };
}
