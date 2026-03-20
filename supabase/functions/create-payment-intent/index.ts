const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

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

    const { amount, currency, listingId, userId } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('סכום לא תקין');
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount)),
        currency: currency || 'ils',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[listingId]': listingId || '',
        'metadata[userId]': userId || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', JSON.stringify(data));
      throw new Error(data.error?.message || `Stripe error: ${response.status}`);
    }

    if (!data.client_secret) {
      throw new Error('Stripe לא החזיר client_secret');
    }

    return new Response(
      JSON.stringify({ clientSecret: data.client_secret }),
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
