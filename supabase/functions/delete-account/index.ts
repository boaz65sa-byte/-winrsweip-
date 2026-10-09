import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
    ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!url || !anonKey || !serviceKey) {
    return json({ error: 'Server is missing Supabase credentials' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return json({ error: 'Not signed in' }, 401)
  }

  const admin = createClient(url, serviceKey)
  const userId = user.id

  const { data: owned, error: ownedError } = await admin
    .from('listings')
    .select('id')
    .eq('seller_id', userId)
  if (ownedError) return json({ error: ownedError.message }, 500)

  const listingIds = (owned ?? []).map((row) => row.id as string)
  if (listingIds.length > 0) {
    const cleanup = await Promise.all([
      admin.from('messages').delete().in('listing_id', listingIds),
      admin.from('bids').delete().in('listing_id', listingIds),
      admin.from('escrow_transactions').delete().in('listing_id', listingIds),
    ])
    const failed = cleanup.find((result) => result.error)
    if (failed?.error) return json({ error: failed.error.message }, 500)

    const { error: listingsError } = await admin.from('listings').delete().in('id', listingIds)
    if (listingsError) return json({ error: listingsError.message }, 500)
  }

  const personal = await Promise.all([
    admin.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    admin.from('bids').delete().eq('bidder_id', userId),
    admin.from('escrow_transactions').delete().or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
    admin.from('listings').update({
      match_buyer_id: null,
      match_status: null,
      match_amount: null,
    }).eq('match_buyer_id', userId),
  ])
  const personalError = personal.find((result) => result.error)
  if (personalError?.error) return json({ error: personalError.error.message }, 500)

  await removeFolder(admin, 'listings-images', userId)
  await removeFolder(admin, 'images', userId)

  const { error: profileError } = await admin.from('users').delete().eq('id', userId)
  if (profileError) return json({ error: profileError.message }, 500)

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) return json({ error: deleteError.message }, 500)

  return json({ ok: true }, 200)
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function removeFolder(admin: SupabaseClient, bucket: string, userId: string) {
  const { data, error } = await admin.storage.from(bucket).list(userId, { limit: 1000 })
  if (error || !data?.length) return
  const paths = data.filter((file) => file.name && file.id).map((file) => `${userId}/${file.name}`)
  if (paths.length === 0) return
  await admin.storage.from(bucket).remove(paths)
}
