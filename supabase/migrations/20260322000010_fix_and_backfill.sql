-- Backfill users from auth.users (for users who signed up before the trigger)
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Re-create trigger in case it's missing
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

-- Storage policies (drop + recreate to be safe)
DROP POLICY IF EXISTS "listings_images_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "listings_images_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "listings_images_owner_delete" ON storage.objects;

CREATE POLICY "listings_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings-images');

CREATE POLICY "listings_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listings-images' AND auth.role() = 'authenticated');

CREATE POLICY "listings_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listings-images' AND owner_id = auth.uid()::text);
