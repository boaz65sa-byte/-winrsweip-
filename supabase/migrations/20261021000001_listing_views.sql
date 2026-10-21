-- WinrSwipe 1.0.1 (QA WS-04): real viewer counts instead of a hard-coded 0.
-- NOT applied to production. Apply only after dr eggbot / Boaz approval:
--   npx supabase db push --project-ref xkydgfjiofsdqsbozuha   (or paste in SQL editor)
-- The app works without it: the viewers count is simply hidden until it exists.

CREATE TABLE IF NOT EXISTS public.listing_views (
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, viewer_id)
);

ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
-- No direct table policies: clients go through the two functions below,
-- so viewer identities are never exposed.

CREATE OR REPLACE FUNCTION public.record_listing_view(p_listing_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.listing_views (listing_id, viewer_id)
  SELECT p_listing_id, auth.uid()
  WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.listings l WHERE l.id = p_listing_id AND l.seller_id = auth.uid()
    )
  ON CONFLICT (listing_id, viewer_id) DO UPDATE SET viewed_at = now();
$$;

CREATE OR REPLACE FUNCTION public.listing_view_counts(p_listing_ids UUID[])
RETURNS TABLE (listing_id UUID, viewers BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.listing_id, count(*)::bigint
  FROM public.listing_views v
  WHERE v.listing_id = ANY (p_listing_ids)
  GROUP BY v.listing_id;
$$;

REVOKE ALL ON FUNCTION public.record_listing_view(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.listing_view_counts(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_listing_view(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listing_view_counts(UUID[]) TO authenticated;
