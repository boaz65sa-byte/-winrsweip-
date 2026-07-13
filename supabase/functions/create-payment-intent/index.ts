import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const SAFE_TRADE_FEE_RATE = 0.02;
const PLATFORM_FEE_RATE = 0.10;

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY לא מוגדר ב-Supabase Secrets');
    }

    // Identify the caller from their own JWT — never trust a client-supplied userId.
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('משתמש לא מזוהה — נדרשת התחברות');
    }

    const { listingId } = await req.json();
    if (!listingId) {
      throw new Error('listingId חסר');
    }

    // Use the service role to look up the real price server-side — the
    // amount charged must never come from the client.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, seller_id, status, buy_now_price, listing_type, winner_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new Error('מוצר לא נמצא');
    }

    let itemAmount: number;

    if (listing.status === 'ended' && listing.winner_id === user.id) {
      // Auction win — the price is whatever the server recorded as the winning bid.
      const { data: escrow, error: escrowError } = await admin
        .from('escrow_transactions')
        .select('amount, paid')
        .eq('listing_id', listingId)
        .single();
      if (escrowError || !escrow) {
        throw new Error('לא נמצאה עסקת נאמנות עבור המכרז שזכית בו');
      }
      if (escrow.paid) {
        throw new Error('המוצר כבר שולם');
      }
      itemAmount = Number(escrow.amount);
    } else if (
      listing.status === 'active' &&
      (listing.listing_type === 'buynow' || listing.listing_type === 'both') &&
      listing.buy_now_price
    ) {
      // Buy-now — the price is the seller's listed buy-now price.
      itemAmount = Number(listing.buy_now_price);
    } else {
      throw new Error('לא ניתן לרכוש מוצר זה כרגע');
    }

    const safeTradeFee = Math.round(itemAmount * SAFE_TRADE_FEE_RATE);
    const total = itemAmount + safeTradeFee;

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(Math.round(total * 100)),
        currency: 'ils',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[listingId]': listingId,
        'metadata[userId]': user.id,
        'metadata[itemAmount]': String(itemAmount),
        'metadata[safeTradeFee]': String(safeTradeFee),
        'metadata[platformFee]': String(Math.round(itemAmount * PLATFORM_FEE_RATE)),
        'metadata[sellerId]': listing.seller_id ?? '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = `Stripe ${response.status}: ${data.error?.message || JSON.stringify(data)}`;
      console.error('Stripe error:', errMsg);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!data.client_secret) {
      throw new Error('Stripe לא החזיר client_secret');
    }

    return new Response(
      JSON.stringify({ clientSecret: data.client_secret, amount: itemAmount, safeTradeFee, total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Function error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
