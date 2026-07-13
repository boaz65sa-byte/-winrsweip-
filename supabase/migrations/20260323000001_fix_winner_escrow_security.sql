-- ============================================================
-- Fix: crash bugs + payment/escrow trust gaps found in security review
-- ============================================================

-- -----------------------------------------------
-- 1. listings.winner_id was referenced by notify_auction_winners()
--    but never added to the table — every cron run threw an error.
-- -----------------------------------------------
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS listings_winner_id_idx ON public.listings(winner_id);

-- -----------------------------------------------
-- 2. escrow_transactions.status CHECK constraint never allowed 'refunded',
--    but the admin dashboard's dispute resolution (web/app/escrow/page.tsx)
--    writes 'refunded' when a dispute is ruled in the buyer's favor —
--    that write fails with a constraint violation today.
-- -----------------------------------------------
ALTER TABLE public.escrow_transactions
  DROP CONSTRAINT IF EXISTS escrow_transactions_status_check;

ALTER TABLE public.escrow_transactions
  ADD CONSTRAINT escrow_transactions_status_check
  CHECK (status IN ('holding', 'shipped', 'completed', 'dispute', 'refunded'));

-- -----------------------------------------------
-- 3. Auction settlement: create the winner's escrow row server-side,
--    atomically with declaring the winner. Previously no server code
--    created this row at all — the app only worked "by accident" because
--    app/index.tsx (but not app/listing.tsx) wrote an escrow row on
--    EVERY bid (fixed separately in app/index.tsx), which meant a bid
--    placed from the listing detail screen never gave the winner a way
--    to pay. This makes the win flow deterministic regardless of screen.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION notify_auction_winners()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  auction RECORD;
  winner RECORD;
  safe_trade_fee NUMERIC(12,2);
  platform_fee NUMERIC(12,2);
BEGIN
  FOR auction IN
    SELECT l.*, u.push_token AS seller_token
    FROM listings l
    LEFT JOIN users u ON u.id = l.seller_id
    WHERE l.status = 'active'
      AND l.ends_at <= NOW()
      AND l.ends_at > NOW() - INTERVAL '1 minute'
  LOOP
    SELECT b.bidder_id, b.amount, u.push_token
    INTO winner
    FROM bids b
    LEFT JOIN users u ON u.id = b.bidder_id
    WHERE b.listing_id = auction.id
    ORDER BY b.amount DESC
    LIMIT 1;

    IF winner.bidder_id IS NOT NULL THEN
      UPDATE listings
      SET status = 'ended', winner_id = winner.bidder_id
      WHERE id = auction.id;

      safe_trade_fee := ROUND(winner.amount * 0.02);
      platform_fee := ROUND(winner.amount * 0.10);

      INSERT INTO public.escrow_transactions
        (listing_id, buyer_id, seller_id, amount, safe_trade_fee, platform_fee, status, paid)
      VALUES
        (auction.id, winner.bidder_id, auction.seller_id, winner.amount, safe_trade_fee, platform_fee, 'holding', false)
      ON CONFLICT (listing_id) DO UPDATE
        SET buyer_id = EXCLUDED.buyer_id,
            amount = EXCLUDED.amount,
            safe_trade_fee = EXCLUDED.safe_trade_fee,
            platform_fee = EXCLUDED.platform_fee;

      IF winner.push_token IS NOT NULL THEN
        PERFORM
          net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
              'user_id', winner.bidder_id,
              'title', '🏆 זכית במכרז!',
              'body', 'זכית ב"' || auction.title || '" — היכנס לביצוע תשלום',
              'data', jsonb_build_object('screen', '/won')
            )
          );
      END IF;

      IF auction.seller_id IS NOT NULL THEN
        PERFORM
          net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
              'user_id', auction.seller_id,
              'title', '🎉 המכרז שלך הסתיים!',
              'body', '"' || auction.title || '" נמכר ב-₪' || winner.amount,
              'data', jsonb_build_object('screen', '/profile')
            )
          );
      END IF;

    ELSE
      UPDATE listings SET status = 'expired' WHERE id = auction.id;
    END IF;

  END LOOP;
END;
$$;

-- -----------------------------------------------
-- 4. bids RLS only checked bidder_id = auth.uid() — a seller could bid
--    on their own listing via a direct API call (app/index.tsx's quick-bid
--    UI didn't even have the client-side guard app/listing.tsx has).
--    Make it authoritative at the DB level.
-- -----------------------------------------------
DROP POLICY IF EXISTS "bids_insert_auth" ON public.bids;
CREATE POLICY "bids_insert_auth"
  ON public.bids FOR INSERT
  WITH CHECK (
    bidder_id = auth.uid()
    AND listing_id NOT IN (SELECT id FROM public.listings WHERE seller_id = auth.uid())
  );

-- -----------------------------------------------
-- 5. escrow_transactions RLS let the buyer OR seller UPDATE any column,
--    including `paid`, `amount`, and the fee columns — a client could
--    mark an escrow as paid without ever charging a card (see
--    app/payment.tsx, which did exactly this). Restrict clients to a
--    narrow, valid status state machine; `paid` and the money columns
--    become writable only by the service role (the stripe-webhook
--    function and the admin dashboard, both of which use the service key).
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_escrow_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.paid IS DISTINCT FROM OLD.paid
     OR NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.safe_trade_fee IS DISTINCT FROM OLD.safe_trade_fee
     OR NEW.platform_fee IS DISTINCT FROM OLD.platform_fee
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id THEN
    RAISE EXCEPTION 'Only the escrow status may be changed by a client';
  END IF;

  IF auth.uid() = OLD.seller_id THEN
    IF NOT (OLD.status = 'holding' AND NEW.status = 'shipped') THEN
      RAISE EXCEPTION 'Invalid seller escrow transition: % -> %', OLD.status, NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.buyer_id THEN
    IF NOT (OLD.status = 'shipped' AND NEW.status IN ('completed', 'dispute')) THEN
      RAISE EXCEPTION 'Invalid buyer escrow transition: % -> %', OLD.status, NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not authorized to update this escrow transaction';
END;
$$;

DROP TRIGGER IF EXISTS enforce_escrow_update_trigger ON public.escrow_transactions;
CREATE TRIGGER enforce_escrow_update_trigger
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_escrow_update();

-- escrow_insert_buyer is no longer needed for the winning flow (the
-- server creates the row on auction end) but buy-now still needs the
-- stripe-webhook (service role) to be able to insert on first payment —
-- service role bypasses RLS entirely, so no client INSERT policy change
-- is required here. Client-side INSERT is intentionally left unused now;
-- kept for backward compatibility with any code path that still expects it.
