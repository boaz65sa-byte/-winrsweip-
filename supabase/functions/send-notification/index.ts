import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, data } = await req.json();

    if (!user_id || !title || !body) {
      throw new Error('חסרים שדות: user_id, title, body');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // שלוף push_token מהמשתמש
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('push_token')
      .eq('id', user_id)
      .single();

    if (userError || !userData?.push_token) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'אין push_token למשתמש' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // שלח דרך Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userData.push_token,
        sound: 'default',
        title,
        body,
        data: data || {},
      }),
    });

    const result = await response.json();
    console.log('Expo push result:', JSON.stringify(result));

    return new Response(
      JSON.stringify({ ok: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('send-notification error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
