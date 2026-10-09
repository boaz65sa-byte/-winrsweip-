import { Alert } from 'react-native'
import { supabase } from './supabase'

type RouterLike = {
  push: (href: { pathname: string; params: Record<string, string> }) => void
}

export async function startSellerChat(
  router: RouterLike,
  listing: { id?: string | null; title?: string | null; seller_id?: string | null },
  options?: { sendOpener?: boolean },
) {
  const listingId = listing?.id ?? ''
  const sellerId = listing?.seller_id ?? ''
  if (!listingId || !sellerId) {
    Alert.alert('אין מוכר', 'למודעה הזו אין פרטי קשר. אפשר לעבור למודעה הבאה.')
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    Alert.alert('שגיאה', 'התחבר קודם')
    return
  }
  if (user.id === sellerId) {
    Alert.alert('זו המודעה שלך', 'קונים יכולים ליצור איתך קשר מהמודעה.')
    return
  }

  let otherName = 'המוכר'
  const { data: card } = await supabase
    .from('seller_cards')
    .select('full_name')
    .eq('id', sellerId)
    .maybeSingle()
  if (card?.full_name) otherName = card.full_name

  const title = listing.title?.trim()
  const opener = title
    ? `היי, אני מעוניין/ת ב"${title}". אפשר לתאם?`
    : 'היי, אני מעוניין/ת בפריט. אפשר לתאם?'

  if (options?.sendOpener !== false) {
    await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: sellerId,
      content: opener,
    })
  }

  router.push({
    pathname: '/chat',
    params: {
      listingId,
      otherUserId: sellerId,
      otherName,
      listingTitle: title || 'פריט',
    },
  })
}
