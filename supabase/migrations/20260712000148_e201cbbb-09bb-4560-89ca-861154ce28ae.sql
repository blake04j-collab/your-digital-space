
ALTER TABLE public.x_tracker_accounts
  ADD COLUMN IF NOT EXISTS last_screenshot_upload_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

CREATE TABLE IF NOT EXISTS public.x_tracker_screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.x_tracker_accounts(id) ON DELETE CASCADE,
  x_username TEXT NOT NULL,
  employee_name TEXT NOT NULL DEFAULT '',
  previous_views BIGINT NOT NULL DEFAULT 0,
  new_views BIGINT NOT NULL DEFAULT 0,
  views_gained BIGINT NOT NULL DEFAULT 0,
  payout_cents BIGINT NOT NULL DEFAULT 0,
  rate_cents_per_1k INTEGER NOT NULL DEFAULT 300,
  screenshot_url TEXT NOT NULL,
  detected_views BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS x_tracker_screenshots_account_idx ON public.x_tracker_screenshots (account_id, uploaded_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.x_tracker_screenshots TO authenticated;
GRANT ALL ON public.x_tracker_screenshots TO service_role;

ALTER TABLE public.x_tracker_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage x_tracker_screenshots"
  ON public.x_tracker_screenshots FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
