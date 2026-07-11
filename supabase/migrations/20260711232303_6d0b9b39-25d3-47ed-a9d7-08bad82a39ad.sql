
CREATE TABLE public.x_tracker_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  x_username TEXT NOT NULL UNIQUE,
  employee_name TEXT NOT NULL DEFAULT '',
  notes TEXT,
  profile_url TEXT NOT NULL,
  pinned_post_url TEXT,
  current_views BIGINT NOT NULL DEFAULT 0,
  weekly_starting_views BIGINT NOT NULL DEFAULT 0,
  rate_cents_per_1k INTEGER NOT NULL DEFAULT 300,
  status TEXT NOT NULL DEFAULT 'updated',
  status_message TEXT,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.x_tracker_accounts TO authenticated;
GRANT ALL ON public.x_tracker_accounts TO service_role;

ALTER TABLE public.x_tracker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage x tracker accounts"
  ON public.x_tracker_accounts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.x_tracker_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.x_tracker_accounts(id) ON DELETE SET NULL,
  x_username TEXT NOT NULL,
  employee_name TEXT NOT NULL DEFAULT '',
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  starting_views BIGINT NOT NULL DEFAULT 0,
  ending_views BIGINT NOT NULL DEFAULT 0,
  weekly_views BIGINT NOT NULL DEFAULT 0,
  weekly_pay_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX x_tracker_history_username_idx ON public.x_tracker_history (x_username);
CREATE INDEX x_tracker_history_week_start_idx ON public.x_tracker_history (week_start DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.x_tracker_history TO authenticated;
GRANT ALL ON public.x_tracker_history TO service_role;

ALTER TABLE public.x_tracker_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage x tracker history"
  ON public.x_tracker_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.x_tracker_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER x_tracker_accounts_updated_at
  BEFORE UPDATE ON public.x_tracker_accounts
  FOR EACH ROW EXECUTE FUNCTION public.x_tracker_touch_updated_at();
