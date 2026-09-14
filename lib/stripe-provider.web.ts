import { type ReactNode } from 'react';

/** Stripe's native CardField spec cannot load on web. Payments are iOS/Android only. */
export function StripeProvider({ children }: { children: ReactNode; publishableKey?: string }) {
  return children;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe is not available on web' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe is not available on web' } }),
  };
}
