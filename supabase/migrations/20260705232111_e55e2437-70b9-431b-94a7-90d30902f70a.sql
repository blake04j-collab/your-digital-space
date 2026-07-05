
CREATE TABLE public.twitter_va_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text NOT NULL DEFAULT '',
  discord_username text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  twitter_account_available boolean NOT NULL DEFAULT false,
  twitter_username text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.twitter_va_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.twitter_va_applications TO authenticated;
GRANT ALL ON public.twitter_va_applications TO service_role;

ALTER TABLE public.twitter_va_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit twitter va applications"
  ON public.twitter_va_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view twitter va applications"
  ON public.twitter_va_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update twitter va applications"
  ON public.twitter_va_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete twitter va applications"
  ON public.twitter_va_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX twitter_va_applications_created_at_idx ON public.twitter_va_applications (created_at DESC);
