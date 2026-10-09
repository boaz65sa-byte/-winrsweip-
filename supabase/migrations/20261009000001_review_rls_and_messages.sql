-- App Review: authenticated users must be able to read the live feed,
-- place a bid, and message a seller. The live project had RLS enabled
-- with zero policies, which returns an empty feed after a successful login.

-- -----------------------------------------------
-- users: own row only. Public seller names go through seller_cards.
-- -----------------------------------------------
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_trigger" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

CREATE OR REPLACE VIEW public.seller_cards
WITH (security_invoker = false) AS
SELECT id, full_name, city, is_verified
FROM public.users;

COMMENT ON VIEW public.seller_cards IS
  'Public seller card. security_invoker is false so buyers can read a name and city without exposing phone, address, or push tokens on public.users.';

REVOKE ALL ON public.seller_cards FROM PUBLIC, anon;
GRANT SELECT ON public.seller_cards TO authenticated;

-- -----------------------------------------------
-- listings
-- -----------------------------------------------
DROP POLICY IF EXISTS "listings_read_active" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_own" ON public.listings;
DROP POLICY IF EXISTS "listings_update_own" ON public.listings;

CREATE POLICY "listings_read_active" ON public.listings
  FOR SELECT USING (
    status = 'active'
    OR seller_id = auth.uid()
    OR id IN (SELECT listing_id FROM public.bids WHERE bidder_id = auth.uid())
  );

CREATE POLICY "listings_insert_own" ON public.listings
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "listings_update_own" ON public.listings
  FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- -----------------------------------------------
-- bids + current price trigger
-- -----------------------------------------------
DROP POLICY IF EXISTS "bids_read_involved" ON public.bids;
DROP POLICY IF EXISTS "bids_read_all_auth" ON public.bids;
DROP POLICY IF EXISTS "bids_insert_auth" ON public.bids;

CREATE POLICY "bids_read_all_auth" ON public.bids
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "bids_insert_auth" ON public.bids
  FOR INSERT WITH CHECK (bidder_id = auth.uid());

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.update_current_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listings
  SET current_bid = NEW.amount
  WHERE id = NEW.listing_id
    AND (current_bid IS NULL OR NEW.amount > current_bid);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_bid_inserted ON public.bids;
CREATE TRIGGER on_bid_inserted
  AFTER INSERT ON public.bids
  FOR EACH ROW EXECUTE FUNCTION private.update_current_bid();

-- -----------------------------------------------
-- messages (table was missing on the live project)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_listing_id_idx  ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx   ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read_involved" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_update_read" ON public.messages;
DROP POLICY IF EXISTS "Users see own messages" ON public.messages;
DROP POLICY IF EXISTS "Users send own messages" ON public.messages;
DROP POLICY IF EXISTS "Users update own received messages" ON public.messages;

CREATE POLICY "messages_read_involved" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND receiver_id IS NOT NULL
    AND receiver_id <> auth.uid()
  );

CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- -----------------------------------------------
-- escrow (kept for when payments are turned back on)
-- -----------------------------------------------
DROP POLICY IF EXISTS "escrow_read_involved" ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_insert_buyer" ON public.escrow_transactions;
DROP POLICY IF EXISTS "escrow_update_buyer" ON public.escrow_transactions;

CREATE POLICY "escrow_read_involved" ON public.escrow_transactions
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "escrow_insert_buyer" ON public.escrow_transactions
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "escrow_update_buyer" ON public.escrow_transactions
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());
