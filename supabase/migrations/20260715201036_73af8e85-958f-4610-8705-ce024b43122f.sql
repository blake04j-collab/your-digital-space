-- Fix manager upload policy (previously required account row to exist first, breaking new-account uploads)
DROP POLICY IF EXISTS "Managers upload x-screenshots for own accounts" ON storage.objects;

CREATE POLICY "Managers upload x-screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'manager'));

-- Employees: upload / read / update / delete their own screenshots
CREATE POLICY "Employees upload x-screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees read x-screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'employee') AND owner = auth.uid());

CREATE POLICY "Employees update own x-screenshots"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'employee') AND owner = auth.uid())
WITH CHECK (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'employee') AND owner = auth.uid());

CREATE POLICY "Employees delete own x-screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'employee') AND owner = auth.uid());

-- Managers: read screenshots in the bucket (their own uploads + team; row-level checks stay in table policies)
CREATE POLICY "Managers read x-screenshots (bucket)"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'x-screenshots' AND public.has_role(auth.uid(), 'manager'));