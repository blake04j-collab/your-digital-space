
-- Ownership columns
ALTER TABLE public.x_tracker_accounts ADD COLUMN IF NOT EXISTS added_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.x_tracker_screenshots ADD COLUMN IF NOT EXISTS added_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.x_tracker_history ADD COLUMN IF NOT EXISTS added_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS x_tracker_accounts_added_by_idx ON public.x_tracker_accounts(added_by_user_id);
CREATE INDEX IF NOT EXISTS x_tracker_screenshots_added_by_idx ON public.x_tracker_screenshots(added_by_user_id);
CREATE INDEX IF NOT EXISTS x_tracker_history_added_by_idx ON public.x_tracker_history(added_by_user_id);

-- Manager policies (row-scoped to owner)
CREATE POLICY "Managers manage own x tracker accounts"
  ON public.x_tracker_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::public.app_role) AND added_by_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'manager'::public.app_role) AND added_by_user_id = auth.uid());

CREATE POLICY "Managers manage own x tracker screenshots"
  ON public.x_tracker_screenshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::public.app_role) AND added_by_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'manager'::public.app_role) AND added_by_user_id = auth.uid());

CREATE POLICY "Managers read own x tracker history"
  ON public.x_tracker_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager'::public.app_role) AND added_by_user_id = auth.uid());

-- Storage: managers can upload/read only within their own account folders (path prefix = account uuid they own)
CREATE POLICY "Managers upload x-screenshots for own accounts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'x-screenshots'
    AND public.has_role(auth.uid(), 'manager'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.x_tracker_accounts a
      WHERE a.added_by_user_id = auth.uid()
        AND (storage.foldername(name))[1] = a.id::text
    )
  );

CREATE POLICY "Managers read x-screenshots for own accounts"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'x-screenshots'
    AND public.has_role(auth.uid(), 'manager'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.x_tracker_accounts a
      WHERE a.added_by_user_id = auth.uid()
        AND (storage.foldername(name))[1] = a.id::text
    )
  );
