-- ============================================================
-- WinrSwipe — Initial Schema Migration
-- Run this in the Supabase SQL Editor (new project)
-- ============================================================

-- -----------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------
-- 2. USERS TABLE
-- Mirrors auth.users — created automatically on signup via trigger
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT,
  full_name        TEXT,
  phone            TEXT,
  shipping_address TEXT,
  city             TEXT,
  zip_code         TEXT,
  push_token       TEXT,
  is_verified      BOOLEAN NOT NULL DEFAULT false,
  is_banned        BOOLEAN NOT NULL DEFAULT false,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-insert a row in public.users when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------
-- 3. LISTINGS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  condition       TEXT,
  city            TEXT,
  starting_price  NUMERIC(12,2) NOT NULL,
  current_bid     NUMERIC(12,2),
  reserve_price   NUMERIC(12,2),
  buy_now_price   NUMERIC(12,2),
  duration_hours  INTEGER NOT NULL DEFAULT 24,
  listing_type    TEXT NOT NULL DEFAULT 'both'
                  CHECK (listing_type IN ('auction', 'buynow', 'both')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'active', 'sold', 'rejected', 'expired')),
  ends_at         TIMESTAMPTZ,
  images          TEXT[] NOT NULL DEFAULT '{}',
  video_url       TEXT,
  match_status    TEXT,
  match_buyer_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  match_amount    NUMERIC(12,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_status_idx      ON public.listings(status);
CREATE INDEX IF NOT EXISTS listings_seller_id_idx   ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS listings_ends_at_idx     ON public.listings(ends_at);

-- -----------------------------------------------
-- 4. BIDS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.bids (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  bidder_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount      NUMERIC(12,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bids_listing_id_idx ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS bids_bidder_id_idx  ON public.bids(bidder_id);

-- -----------------------------------------------
-- 5. ESCROW TRANSACTIONS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID UNIQUE NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  seller_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount          NUMERIC(12,2) NOT NULL,
  safe_trade_fee  NUMERIC(12,2),
  platform_fee    NUMERIC(12,2),
  status          TEXT NOT NULL DEFAULT 'holding'
                  CHECK (status IN ('holding', 'shipped', 'completed', 'dispute')),
  paid            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS escrow_buyer_id_idx  ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS escrow_seller_id_idx ON public.escrow_transactions(seller_id);

-- -----------------------------------------------
-- 6. MESSAGES TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  receiver_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_listing_id_idx  ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx   ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);

-- -----------------------------------------------
-- 7. ADMIN STATS VIEW
-- Used by admin.tsx dashboard
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT count(*)  FROM public.users)                                              AS total_users,
  (SELECT count(*)  FROM public.listings WHERE status = 'active')                  AS active_listings,
  (SELECT count(*)  FROM public.listings WHERE status = 'sold')                    AS total_sold,
  (SELECT count(*)  FROM public.bids)                                               AS total_bids,
  (SELECT coalesce(sum(amount), 0)        FROM public.escrow_transactions WHERE status = 'completed') AS total_gmv,
  (SELECT coalesce(sum(platform_fee), 0)  FROM public.escrow_transactions WHERE status = 'completed') AS total_revenue,
  (SELECT count(*)  FROM public.listings WHERE created_at::date = current_date)    AS listings_today,
  (SELECT count(*)  FROM public.bids      WHERE created_at::date = current_date)   AS bids_today;

-- -----------------------------------------------
-- 8. AUTO-EXPIRE LISTINGS FUNCTION
-- Schedule with pg_cron (see bottom of file)
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET status = 'expired'
  WHERE status = 'active'
    AND ends_at < now();
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------
-- 9. ROW LEVEL SECURITY
-- -----------------------------------------------
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;

-- USERS policies
DROP POLICY IF EXISTS "users_read_own"        ON public.users;
DROP POLICY IF EXISTS "users_update_own"      ON public.users;
DROP POLICY IF EXISTS "users_insert_trigger"  ON public.users;
CREATE POLICY "users_read_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_trigger" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- LISTINGS policies
DROP POLICY IF EXISTS "listings_read_active"  ON public.listings;
DROP POLICY IF EXISTS "listings_insert_own"   ON public.listings;
DROP POLICY IF EXISTS "listings_update_own"   ON public.listings;
CREATE POLICY "listings_read_active"
  ON public.listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "listings_insert_own"
  ON public.listings FOR INSERT
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (seller_id = auth.uid());

-- BIDS policies
DROP POLICY IF EXISTS "bids_read_involved"  ON public.bids;
DROP POLICY IF EXISTS "bids_insert_auth"    ON public.bids;
CREATE POLICY "bids_read_involved"
  ON public.bids FOR SELECT
  USING (
    bidder_id = auth.uid()
    OR listing_id IN (SELECT id FROM public.listings WHERE seller_id = auth.uid())
  );

CREATE POLICY "bids_insert_auth"
  ON public.bids FOR INSERT
  WITH CHECK (bidder_id = auth.uid());

-- ESCROW TRANSACTIONS policies
DROP POLICY IF EXISTS "escrow_read_involved"  ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_insert_buyer"   ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_update_buyer"   ON public.escrow_transactions;
CREATE POLICY "escrow_read_involved"
  ON public.escrow_transactions FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "escrow_insert_buyer"
  ON public.escrow_transactions FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "escrow_update_buyer"
  ON public.escrow_transactions FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- MESSAGES policies
DROP POLICY IF EXISTS "messages_read_involved"  ON public.messages;
DROP POLICY IF EXISTS "messages_insert_sender"  ON public.messages;
DROP POLICY IF EXISTS "messages_update_read"    ON public.messages;
CREATE POLICY "messages_read_involved"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_read"
  ON public.messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- -----------------------------------------------
-- 10. STORAGE BUCKET
-- Run separately in Supabase Dashboard > Storage
-- or via the management API. SQL below is for reference.
-- -----------------------------------------------
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('listings-images', 'listings-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS (run after creating bucket):
-- CREATE POLICY "listings_images_public_read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'listings-images');
--
-- CREATE POLICY "listings_images_auth_upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'listings-images' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "listings_images_owner_delete"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'listings-images' AND owner = auth.uid()::text);

-- -----------------------------------------------
-- 11. PG_CRON — expire listings every 5 minutes
-- Requires pg_cron extension enabled in Supabase Dashboard
-- (Database > Extensions > pg_cron)
-- Run this AFTER enabling the extension:
-- -----------------------------------------------
-- SELECT cron.schedule(
--   'expire-listings',
--   '*/5 * * * *',
--   'SELECT public.expire_old_listings()'
-- );
