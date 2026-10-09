/**
 * Idempotent demo catalog for the free App Review build.
 *
 * Replaces the known junk listings (test titles, no photos) with 15 Hebrew
 * listings, each with a photo in the public listings-images bucket. Does not
 * delete auth users. Never updates the App Review account.
 *
 *   SUPABASE_URL=https://xkydgfjiofsdqsbozuha.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node supabase/seed/demo-listings.mjs
 *
 * The service role is required because storage uploads and cross-seller
 * updates are blocked for the anon key. The key is not stored in the repo.
 */

import { createClient } from '@supabase/supabase-js';

export const PROJECT_HOST = 'xkydgfjiofsdqsbozuha.supabase.co';
export const REVIEWER_ID = '470b8154-856d-408a-967c-380f25181989';
export const REVIEWER_EMAIL = 'appreview@bs-simple.com';

export const SELLERS = [
  {
    id: 'a11ce001-5eed-4000-8000-000000000001',
    email: 'seed.ori.mizrahi@winrswipe.app',
    full_name: 'אורי מזרחי',
    city: 'תל אביב',
    is_verified: true,
    notes: 'demo-seed',
  },
  {
    id: 'a11ce002-5eed-4000-8000-000000000002',
    email: 'seed.shira.dahan@winrswipe.app',
    full_name: 'שירה דהן',
    city: 'ירושלים',
    is_verified: true,
    notes: 'demo-seed',
  },
];

/** Active junk rows on 2026-10-09: test titles or no photo. */
export const JUNK_LISTING_IDS = [
  '4d639e8b-f15e-436c-b9e1-b135f78eebef',
  'fb867f70-8616-487a-a35c-fbea60779274',
  'a136f91b-13ce-48c0-a425-cf7822dd8a17',
  'a846a9a2-edb1-494d-ac2d-0483aa9e0fd5',
  '90081f66-8bd6-4272-88a0-d46990ca4c1b',
  '0202b892-e10e-46ac-b25c-e57423ac53e6',
  '15ea9cb4-dd73-4d93-a526-9bbb2b075528',
  '1ff26f21-e9b6-43ab-a023-b6c763006e10',
  'c5e4af21-68b5-4723-8611-343571ed2e30',
];

const A = SELLERS[0].id;
const B = SELLERS[1].id;

export const LISTINGS = [
  {
    id: 'd1000001-5eed-4000-8000-000000000001',
    slug: 'laptop',
    photo: 'photo-1496181133206-80ce9b88a853',
    seller_id: A,
    title: 'מחשב נייד 13 אינץ׳',
    description: 'מחשב נייד קל ללימודים ולעבודה. סוללה תקינה, מגיע עם מטען. איסוף בתל אביב.',
    category: 'אלקטרוניקה',
    condition: 'כמו חדש',
    city: 'תל אביב',
    starting_price: 2800,
    current_bid: 3450,
    buy_now_price: 4200,
  },
  {
    id: 'd1000002-5eed-4000-8000-000000000002',
    slug: 'camera',
    photo: 'photo-1516035069371-29a1b244cc32',
    seller_id: B,
    title: 'מצלמת פילם וינטג׳',
    description: 'מצלמת פילם מכנית במצב מצוין. נבדקה עם גליל. איסוף בירושלים.',
    category: 'מצלמות',
    condition: 'כמו חדש',
    city: 'ירושלים',
    starting_price: 650,
    current_bid: 820,
    buy_now_price: 1100,
  },
  {
    id: 'd1000003-5eed-4000-8000-000000000003',
    slug: 'jacket',
    photo: 'photo-1551028719-00167b16eac5',
    seller_id: A,
    title: 'ג׳קט עור וינטג׳',
    description: 'ג׳קט עור במידה M, בטנה תקינה, ללא קרעים. איסוף בחיפה.',
    category: 'אופנה',
    condition: 'טוב',
    city: 'חיפה',
    starting_price: 180,
    current_bid: 240,
    buy_now_price: 350,
  },
  {
    id: 'd1000004-5eed-4000-8000-000000000004',
    slug: 'headphones',
    photo: 'photo-1505740420928-5e560c06d30e',
    seller_id: B,
    title: 'אוזניות אלחוטיות',
    description: 'אוזניות עם ביטול רעשים, נרתיק וטעינה תקינים. איסוף ברמת גן.',
    category: 'אלקטרוניקה',
    condition: 'כמו חדש',
    city: 'רמת גן',
    starting_price: 220,
    current_bid: 280,
    buy_now_price: 390,
  },
  {
    id: 'd1000005-5eed-4000-8000-000000000005',
    slug: 'shoes',
    photo: 'photo-1460353581641-37baddab0fa2',
    seller_id: A,
    title: 'נעלי ריצה',
    description: 'נעלי ריצה מידה 42, נעלו מעט. סוליה שלמה. איסוף בתל אביב.',
    category: 'ספורט',
    condition: 'טוב',
    city: 'תל אביב',
    starting_price: 160,
    current_bid: 190,
    buy_now_price: 280,
  },
  {
    id: 'd1000006-5eed-4000-8000-000000000006',
    slug: 'guitar',
    photo: 'photo-1510915361894-db8b60106cb1',
    seller_id: B,
    title: 'גיטרה אקוסטית',
    description: 'גיטרה אקוסטית עם תיק רך. מיתרים חדשים. איסוף בירושלים.',
    category: 'מוזיקה',
    condition: 'טוב',
    city: 'ירושלים',
    starting_price: 450,
    current_bid: 520,
    buy_now_price: 750,
  },
  {
    id: 'd1000007-5eed-4000-8000-000000000007',
    slug: 'bicycle',
    photo: 'photo-1485965120184-e220f721d03e',
    seller_id: A,
    title: 'אופני עיר',
    description: 'אופני עיר עם סל קדמי. בלמים ומעביר הילוכים תקינים. איסוף בתל אביב.',
    category: 'ספורט',
    condition: 'טוב',
    city: 'תל אביב',
    starting_price: 480,
    current_bid: 560,
    buy_now_price: 800,
  },
  {
    id: 'd1000008-5eed-4000-8000-000000000008',
    slug: 'watch',
    photo: 'photo-1524805444758-089113d48a6d',
    seller_id: B,
    title: 'שעון יד אנלוגי',
    description: 'שעון יד עם רצועת עור, מנגנון עובד. איסוף בהרצליה.',
    category: 'אופנה',
    condition: 'כמו חדש',
    city: 'הרצליה',
    starting_price: 320,
    current_bid: 390,
    buy_now_price: 550,
  },
  {
    id: 'd1000009-5eed-4000-8000-000000000009',
    slug: 'backpack',
    photo: 'photo-1553062407-98eeb64c6a62',
    seller_id: A,
    title: 'תיק גב ליום יום',
    description: 'תיק גב עם תא למחשב נייד. בד שלם, רוכסנים תקינים. איסוף בחיפה.',
    category: 'אופנה',
    condition: 'כמו חדש',
    city: 'חיפה',
    starting_price: 90,
    current_bid: 120,
    buy_now_price: 180,
  },
  {
    id: 'd100000a-5eed-4000-8000-00000000000a',
    slug: 'lamp',
    photo: 'photo-1507473885765-e6ed057f782c',
    seller_id: B,
    title: 'מנורת שולחן',
    description: 'מנורת שולחן עם זרוע מתכווננת. נורה כלולה. איסוף בראשון לציון.',
    category: 'בית וגן',
    condition: 'טוב',
    city: 'ראשון לציון',
    starting_price: 70,
    current_bid: 90,
    buy_now_price: 140,
  },
  {
    id: 'd100000b-5eed-4000-8000-00000000000b',
    slug: 'coffee',
    photo: 'photo-1517668808822-9ebb02f2a0e6',
    seller_id: A,
    title: 'מכונת קפה ביתית',
    description: 'מכונת קפה ביתית, עובדת, כוללת קנקן. איסוף בנתניה.',
    category: 'בית וגן',
    condition: 'טוב',
    city: 'נתניה',
    starting_price: 250,
    current_bid: 310,
    buy_now_price: 450,
  },
  {
    id: 'd100000c-5eed-4000-8000-00000000000c',
    slug: 'plant',
    photo: 'photo-1485955900006-10f4d324d411',
    seller_id: B,
    title: 'עציץ מונסטרה',
    description: 'צמח מבוסס בעציץ קרמיקה. איסוף בתל אביב, לא נשלח.',
    category: 'בית וגן',
    condition: 'טוב',
    city: 'תל אביב',
    starting_price: 80,
    current_bid: 95,
    buy_now_price: 150,
  },
  {
    id: 'd100000d-5eed-4000-8000-00000000000d',
    slug: 'print',
    photo: 'photo-1513519245088-0e12902e5a38',
    seller_id: A,
    title: 'הדפס אמנות ממוסגר',
    description: 'הדפס ממוסגר, זכוכית שלמה. איסוף בבאר שבע.',
    category: 'אומנות',
    condition: 'כמו חדש',
    city: 'באר שבע',
    starting_price: 200,
    current_bid: 260,
    buy_now_price: 380,
  },
  {
    id: 'd100000e-5eed-4000-8000-00000000000e',
    slug: 'sunglasses',
    photo: 'photo-1511499767150-a48a237f0083',
    seller_id: B,
    title: 'משקפי שמש',
    description: 'משקפי שמש עם עדשות כהות ומארז. איסוף באשדוד.',
    category: 'אופנה',
    condition: 'חדש',
    city: 'אשדוד',
    starting_price: 70,
    current_bid: 85,
    buy_now_price: 130,
  },
  {
    id: 'd100000f-5eed-4000-8000-00000000000f',
    slug: 'chair',
    photo: 'photo-1506439773649-6e0eb8cfb237',
    seller_id: A,
    title: 'כיסא עץ',
    description: 'כיסא עץ יציב לפינת אוכל. ללא שברים. איסוף בחולון.',
    category: 'בית וגן',
    condition: 'טוב',
    city: 'חולון',
    starting_price: 120,
    current_bid: 150,
    buy_now_price: 220,
  },
];

export const BIDS = [
  { id: 'b1000001-5eed-4000-8000-000000000001', listing_id: LISTINGS[0].id, bidder_id: B, amount: 3450 },
  { id: 'b1000002-5eed-4000-8000-000000000002', listing_id: LISTINGS[1].id, bidder_id: A, amount: 820 },
  { id: 'b1000003-5eed-4000-8000-000000000003', listing_id: LISTINGS[2].id, bidder_id: B, amount: 240 },
  { id: 'b1000004-5eed-4000-8000-000000000004', listing_id: LISTINGS[5].id, bidder_id: A, amount: 520 },
  { id: 'b1000005-5eed-4000-8000-000000000005', listing_id: LISTINGS[6].id, bidder_id: B, amount: 560 },
];

export function photoUrl(photoId) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80&fm=jpg`;
}

export function storagePath(slug) {
  return `seed/${slug}.jpg`;
}

export function publicImageUrl(supabaseUrl, slug) {
  const base = supabaseUrl.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/listings-images/${storagePath(slug)}`;
}

function assertCatalog() {
  if (LISTINGS.length < 12 || LISTINGS.length > 15) {
    throw new Error(`expected 12-15 listings, got ${LISTINGS.length}`);
  }
  const ids = new Set();
  for (const listing of LISTINGS) {
    if (ids.has(listing.id)) throw new Error(`duplicate listing ${listing.id}`);
    ids.add(listing.id);
    if (listing.seller_id === REVIEWER_ID) throw new Error('seed listing uses the reviewer account');
    if (!listing.title || !listing.description || !listing.city || !listing.category) {
      throw new Error(`incomplete listing ${listing.slug}`);
    }
    if (!(listing.current_bid > listing.starting_price && listing.buy_now_price > listing.current_bid)) {
      throw new Error(`price order is wrong for ${listing.slug}`);
    }
  }
  if (JUNK_LISTING_IDS.some((id) => ids.has(id))) {
    throw new Error('junk id overlaps a seed listing');
  }
  for (const bid of BIDS) {
    const listing = LISTINGS.find((item) => item.id === bid.listing_id);
    if (!listing || bid.bidder_id === listing.seller_id || bid.bidder_id === REVIEWER_ID) {
      throw new Error(`bad bid ${bid.id}`);
    }
  }
}

async function downloadPhoto(listing) {
  const response = await fetch(photoUrl(listing.photo), { redirect: 'follow' });
  if (!response.ok) throw new Error(`download ${listing.slug} failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const type = response.headers.get('content-type') || '';
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  if (bytes.length < 20000 || (!jpeg && !png)) {
    throw new Error(`photo ${listing.slug} is not a usable image (${bytes.length} bytes, ${type})`);
  }
  return { bytes, contentType: jpeg ? 'image/jpeg' : 'image/png' };
}

export async function applyDemoListings({ url, serviceRoleKey }) {
  assertCatalog();
  if (!url || !url.includes(PROJECT_HOST)) {
    throw new Error(`refusing to seed a project other than ${PROJECT_HOST}`);
  }
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const endsAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
  const rows = [];

  for (const listing of LISTINGS) {
    const file = await downloadPhoto(listing);
    const path = storagePath(listing.slug);
    const { error: uploadError } = await supabase.storage.from('listings-images').upload(path, file.bytes, {
      contentType: file.contentType,
      upsert: true,
    });
    if (uploadError) throw new Error(`upload ${listing.slug}: ${uploadError.message}`);
    rows.push({
      id: listing.id,
      seller_id: listing.seller_id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition,
      city: listing.city,
      starting_price: listing.starting_price,
      current_bid: listing.current_bid,
      buy_now_price: listing.buy_now_price,
      listing_type: 'auction',
      status: 'active',
      duration_hours: 24 * 45,
      ends_at: endsAt,
      images: [publicImageUrl(url, listing.slug)],
      seller_name: SELLERS.find((seller) => seller.id === listing.seller_id).full_name,
    });
  }

  const { error: sellerError } = await supabase.from('users').upsert(SELLERS, { onConflict: 'id' });
  if (sellerError) throw new Error(`sellers: ${sellerError.message}`);

  const { data: junkRows, error: junkReadError } = await supabase
    .from('listings')
    .select('id, seller_id, title, status')
    .in('id', JUNK_LISTING_IDS);
  if (junkReadError) throw new Error(`read junk: ${junkReadError.message}`);
  if ((junkRows ?? []).some((row) => row.seller_id === REVIEWER_ID)) {
    throw new Error('refusing to expire a reviewer listing');
  }

  // 'rejected' stays out of the active feed. 'expired' fires
  // notify_seller_expired(), which inserts into a missing notifications table.
  const { data: expired, error: expireError } = await supabase
    .from('listings')
    .update({ status: 'rejected' })
    .in('id', JUNK_LISTING_IDS)
    .select('id');
  if (expireError) throw new Error(`expire junk: ${expireError.message}`);

  const { error: listingError } = await supabase.from('listings').upsert(rows, { onConflict: 'id' });
  if (listingError) throw new Error(`listings: ${listingError.message}`);

  const { error: bidError } = await supabase.from('bids').upsert(BIDS, { onConflict: 'id' });
  if (bidError) throw new Error(`bids: ${bidError.message}`);

  const { error: priceError } = await supabase.from('listings').upsert(
    rows.map((row) => ({ id: row.id, current_bid: row.current_bid, ends_at: endsAt, status: 'active' })),
    { onConflict: 'id' },
  );
  if (priceError) throw new Error(`refresh prices: ${priceError.message}`);

  return {
    expired: expired?.length ?? 0,
    listings: rows.length,
    sellers: SELLERS.length,
    bids: BIDS.length,
  };
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('demo-listings.mjs');
if (isDirectRun) {
  applyDemoListings({
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
