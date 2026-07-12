
CREATE POLICY "Admins read x-screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload x-screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update x-screenshots"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete x-screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'admin'));
