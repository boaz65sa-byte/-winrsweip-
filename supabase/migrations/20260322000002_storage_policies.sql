-- Storage RLS policies for listings-images bucket
CREATE POLICY "listings_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings-images');

CREATE POLICY "listings_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listings-images' AND auth.role() = 'authenticated');

CREATE POLICY "listings_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listings-images' AND owner_id = auth.uid()::text);
