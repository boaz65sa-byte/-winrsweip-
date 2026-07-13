import Stripe from 'https://esm.sh/stripe@17.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

// This is the ONLY place that is allowed to mark an escrow transaction as
// paid — it only runs after Stripe has cryptographically confirmed the
// charge succeeded. app/payment.tsx must never write `paid: true` itself.
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!STRIPE_WEBHOOK_SECRET || !signature) {
    console.error('Missing STRIPE_WEBHOOK_SECRET or stripe-signature header');
    return new Response('Webhook not configured', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Signature verification failed:', err.message);
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { listingId, userId, sellerId, itemAmount, safeTradeFee, platformFee } = intent.metadata;

    if (!listingId || !userId) {
      console.error('payment_intent.succeeded missing metadata', intent.id);
      return new Response('Missing metadata', { status: 400 });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: escrowError } = await admin
      .from('escrow_transactions')
      .upsert({
        listing_id: listingId,
        buyer_id: userId,
        seller_id: sellerId || null,
        amount: Number(itemAmount),
        safe_trade_fee: Number(safeTradeFee),
        platform_fee: Number(platformFee),
        status: 'holding',
        paid: true,
      }, { onConflict: 'listing_id' });

    if (escrowError) {
      console.error('Failed to upsert escrow_transactions:', escrowError.message);
      return new Response('DB error', { status: 500 });
    }

    const { error: listingError } = await admin
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);

    if (listingError) {
      console.error('Failed to mark listing sold:', listingError.message);
      return new Response('DB error', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
