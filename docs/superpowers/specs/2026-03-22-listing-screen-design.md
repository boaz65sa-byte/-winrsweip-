# Listing Detail Screen — Design Spec
Date: 2026-03-22

## Overview
A full-screen detail view (`app/listing.tsx`) for a single auction listing. Opened by tapping any card in the search tab grid. Replaces the current broken navigation that routes to `/listing?id=...`.

## Navigation
- Entry: `router.push({ pathname: '/listing', params: { id: item.id } })` — already wired in `search.tsx:161`
- Back: header back button → `router.back()`

## Layout

### Header (fixed)
- Back button (←)
- LIVE badge (red pill)
- Countdown timer (e.g. ⏱ 12:34) — ticks every second

### Image Carousel (height: 300)
- Horizontal scroll through `listing.images[]`
- Dot indicators below
- Falls back to emoji placeholder if no images

### Body (scrollable)
- Title (large, bold)
- Category · City (sub text)
- Full description
- Divider
- Current bid (large, accent color) + Buy Now price
- Divider
- Bid history list — fetched from `bids` table joined with `profiles`
  - Each row: avatar initial + "First Last" + amount + relative time
  - Maximum 10 rows
- Divider
- Seller card — avatar initial + full name + city + "צור קשר" button (disabled, grayed out — chat feature coming later)

### Sticky Footer
- Two buttons side by side:
  - "הגש הצעה" (primary, accent color) → opens bottom sheet
  - "קנה עכשיו" (secondary, outlined) → navigates to `/payment`

### Bottom Sheet (bid submission)
- Triggered by footer bid button
- Semi-transparent overlay
- Shows current bid, minimum next bid (current + 50)
- Amount input (numeric, pre-filled with minimum)
- "ביטול" + "הצע ₪X ←" buttons
- On submit: inserts into `bids` table, updates `listings.current_bid`

## Data

### Queries
```ts
// Listing
supabase.from('listings').select('*').eq('id', id).single()

// Bids with bidder names
supabase
  .from('bids')
  .select('amount, created_at, profiles(full_name)')
  .eq('listing_id', id)
  .order('created_at', { ascending: false })
  .limit(10)

// Seller profile
supabase.from('profiles').select('full_name, city, avatar_url').eq('id', listing.user_id).single()
```

### Bid insert
```ts
supabase.from('bids').insert({ listing_id, bidder_id, amount })
supabase.from('listings').update({ current_bid: amount }).eq('id', listing_id)
```

## Error States
- Loading spinner while fetching
- "מוצר לא נמצא" if listing fetch fails
- Bid submit errors shown as Alert

## Styling
Follows existing color palette:
- bg: #0D0D0D, card: #1A1A1A, accent: #FF4D1C, text: #FFFFFF, sub: #666666, border: #2A2A2A
- Dark/light mode via ThemeContext

## Files Affected
- **New:** `app/listing.tsx`
- **No changes needed:** `app/search.tsx` (navigation already wired)
