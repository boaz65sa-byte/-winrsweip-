-- Fix bids RLS: allow any authenticated user to read bids for any listing
-- Previously only bidder or seller could see bids — blocked bid history for new viewers
DROP POLICY IF EXISTS "bids_read_involved" ON public.bids;
CREATE POLICY "bids_read_all_auth"
  ON public.bids FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trigger: update listings.current_bid on new bid insert
-- Avoids relying on client-side UPDATE (blocked by RLS for non-sellers)
CREATE OR REPLACE FUNCTION public.update_current_bid()
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
  FOR EACH ROW EXECUTE FUNCTION public.update_current_bid();
