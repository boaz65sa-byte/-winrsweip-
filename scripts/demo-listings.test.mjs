import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BIDS,
  JUNK_LISTING_IDS,
  LISTINGS,
  REVIEWER_ID,
  SELLERS,
} from '../supabase/seed/demo-listings.mjs';

const CITIES = ['תל אביב', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'רמת גן', 'בת ים', 'רחובות', 'אשקלון', 'הרצליה', 'חולון', 'כפר סבא', 'מודיעין', 'לוד', 'רמלה', 'נהריה', 'אחר'];
const CATEGORIES = ['אופנה', 'אלקטרוניקה', 'מצלמות', 'מוזיקה', 'ספורט', 'בית וגן', 'אומנות', 'אחר'];
const CONDITIONS = ['חדש', 'כמו חדש', 'טוב', 'סביר', 'למחזר'];

test('demo catalog is a complete Hebrew feed', () => {
  assert.ok(LISTINGS.length >= 12 && LISTINGS.length <= 15);
  assert.equal(new Set(LISTINGS.map((item) => item.id)).size, LISTINGS.length);
  assert.equal(SELLERS.length, 2);
  for (const seller of SELLERS) {
    assert.notEqual(seller.id, REVIEWER_ID);
    assert.notEqual(seller.email, 'appreview@bs-simple.com');
    assert.equal(seller.notes, 'demo-seed');
  }
  for (const listing of LISTINGS) {
    assert.ok(SELLERS.some((seller) => seller.id === listing.seller_id));
    assert.match(listing.title, /[\u0590-\u05FF]/);
    assert.match(listing.description, /[\u0590-\u05FF]/);
    assert.ok(CATEGORIES.includes(listing.category));
    assert.ok(CONDITIONS.includes(listing.condition));
    assert.ok(CITIES.includes(listing.city));
    assert.ok(listing.starting_price > 0);
    assert.ok(listing.current_bid > listing.starting_price);
    assert.ok(listing.buy_now_price > listing.current_bid);
    assert.ok(listing.photo.startsWith('photo-'));
  }
  assert.equal(new Set(JUNK_LISTING_IDS).size, JUNK_LISTING_IDS.length);
  for (const id of JUNK_LISTING_IDS) {
    assert.ok(!LISTINGS.some((listing) => listing.id === id));
  }
  for (const bid of BIDS) {
    const listing = LISTINGS.find((item) => item.id === bid.listing_id);
    assert.ok(listing);
    assert.notEqual(bid.bidder_id, listing.seller_id);
    assert.notEqual(bid.bidder_id, REVIEWER_ID);
    assert.equal(bid.amount, listing.current_bid);
  }
});
