// Seed script — מכירות דמו עם תמונות אמיתיות
// הרצה: node scripts/seed.mjs
// צריך: SUPABASE_SERVICE_ROLE_KEY מ-Supabase Dashboard → Settings → API

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxpueymbeawmlroknjwe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ חסר SUPABASE_SERVICE_ROLE_KEY');
  console.error('הרץ: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// תמונות אמיתיות מ-Unsplash (חינמיות, ללא API key)
const LISTINGS = [
  {
    title: 'מעיל עור וינטאג׳ - Schott NYC',
    description: 'מעיל עור איכותי מסוג Schott NYC, מידה M, במצב מעולה. שנת ייצור 1998. צבע שחור קלאסי עם רוכסן YKK מקורי.',
    category: 'אופנה',
    condition: 'משומש - מצב טוב',
    city: 'תל אביב',
    starting_price: 350,
    current_bid: 420,
    buy_now_price: 900,
    reserve_price: 600,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
  },
  {
    title: 'מצלמה Nikon FM2 + עדשה 50mm',
    description: 'מצלמת פילם קלאסית Nikon FM2 עם עדשת Nikkor 50mm f/1.4. עובדת מצוין, שאטר מושלם. מגיעה עם תיק עור מקורי.',
    category: 'מצלמות',
    condition: 'משומש - מצב טוב',
    city: 'ירושלים',
    starting_price: 800,
    current_bid: 950,
    buy_now_price: 1800,
    reserve_price: 1200,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    ],
  },
  {
    title: 'גיטרה Fender Stratocaster 1972',
    description: 'Fender Stratocaster אמריקאית מ-1972, בצבע Sunburst. מוחלפים טוקאפים, פרטים מקוריים. מגיעה עם תיק קשיח.',
    category: 'מוזיקה',
    condition: 'וינטאג׳',
    city: 'חיפה',
    starting_price: 3500,
    current_bid: 4200,
    buy_now_price: 8000,
    reserve_price: 5500,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80',
    ],
  },
  {
    title: 'MacBook Air M2 - 16GB / 512GB',
    description: 'MacBook Air M2 שנת 2023, 16GB RAM, 512GB SSD. מצב כמו חדש, ללא שריטות. כולל מטען ו-AppleCare עד 2025.',
    category: 'אלקטרוניקה',
    condition: 'כמו חדש',
    city: 'רמת גן',
    starting_price: 4500,
    current_bid: 5100,
    buy_now_price: 6800,
    reserve_price: 5500,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1611186871525-655e4e07c21a?w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    ],
  },
  {
    title: 'שעון Seiko Automatic Diver',
    description: 'שעון צלילה Seiko SKX007 קלאסי, עמיד למים עד 200m. מכאני אוטומטי, ברצועת מתכת מקורית. מצב מושלם.',
    category: 'אופנה',
    condition: 'משומש - מצב טוב',
    city: 'תל אביב',
    starting_price: 600,
    current_bid: 750,
    buy_now_price: 1400,
    reserve_price: 1000,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80',
    ],
  },
  {
    title: 'אופניים Trek Marlin 7 - 2022',
    description: 'אופני הרים Trek Marlin 7, מסגרת אלומיניום, 27 הילוכים Shimano Deore. מידה L. שימוש קל, גלגלים חדשים.',
    category: 'ספורט',
    condition: 'משומש - מצב טוב',
    city: 'נתניה',
    starting_price: 2200,
    current_bid: 2600,
    buy_now_price: 4000,
    reserve_price: 3000,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    ],
  },
  {
    title: 'כיסא Eames Lounge Chair - עותק',
    description: 'כיסא Eames Lounge Chair & Ottoman, עור חום אמיתי, בסיס אלומיניום. מצב מעולה, שנת רכישה 2020. מידות מקוריות.',
    category: 'בית וגן',
    condition: 'משומש - מצב טוב',
    city: 'הרצליה',
    starting_price: 2800,
    current_bid: 3200,
    buy_now_price: 5500,
    reserve_price: 4000,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
    ],
  },
  {
    title: 'אוסף ויניל - Jazz קלאסי 50 תקליטים',
    description: 'אוסף 50 תקליטי ויניל ג׳אז קלאסי: Miles Davis, Coltrane, Bill Evans. מצב VG+ עד NM. כולל תיק אחסון.',
    category: 'מוזיקה',
    condition: 'וינטאג׳',
    city: 'תל אביב',
    starting_price: 800,
    current_bid: 1100,
    buy_now_price: 2500,
    reserve_price: 1500,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1484876065684-b1cf69b2b1bb?w=800&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    ],
  },
  {
    title: 'Sony PlayStation 5 + 3 משחקים',
    description: 'PS5 Disc Edition, כמו חדש. כולל: God of War Ragnarök, Spider-Man 2, Horizon Forbidden West. שני שלטים.',
    category: 'אלקטרוניקה',
    condition: 'כמו חדש',
    city: 'באר שבע',
    starting_price: 1800,
    current_bid: 2100,
    buy_now_price: 3200,
    reserve_price: 2500,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',
      'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80',
    ],
  },
  {
    title: 'תיק Hermès Birkin 30 - עור',
    description: 'תיק Hermès Birkin 30 אותנטי, עור Togo שחור, חומרה זהב. כולל תעודת אותנטיות, אבק שק ותיבה מקורית.',
    category: 'אופנה',
    condition: 'משומש - מצב טוב',
    city: 'תל אביב',
    starting_price: 35000,
    current_bid: 42000,
    buy_now_price: 75000,
    reserve_price: 55000,
    listing_type: 'both',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
  },
];

async function seed() {
  console.log('🌱 מתחיל seed...');

  // שלוף משתמש קיים לשימוש כמוכר
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const sellerId = users?.[0]?.id;

  if (!sellerId) {
    console.error('❌ לא נמצא משתמש בDB. התחבר לאפליקציה קודם.');
    process.exit(1);
  }

  console.log(`👤 משתמש מוכר: ${sellerId}`);

  // הוסף זמן סיום — 48 שעות מעכשיו
  const endsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  let success = 0;
  for (const listing of LISTINGS) {
    const { error } = await supabase.from('listings').insert({
      ...listing,
      seller_id: sellerId,
      ends_at: endsAt,
    });

    if (error) {
      console.error(`❌ שגיאה ב-"${listing.title}":`, error.message);
    } else {
      console.log(`✓ "${listing.title}"`);
      success++;
    }
  }

  console.log(`\n✅ ${success}/${LISTINGS.length} מכירות נוספו בהצלחה`);
}

seed().catch(console.error);
