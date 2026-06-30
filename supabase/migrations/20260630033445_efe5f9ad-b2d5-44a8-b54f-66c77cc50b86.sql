
CREATE TABLE public.va_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  age INTEGER NOT NULL,
  discord_username TEXT NOT NULL,
  availability TEXT NOT NULL,
  reddit_account_available BOOLEAN NOT NULL DEFAULT false,
  reddit_username TEXT,
  washington_community_answer TEXT NOT NULL,
  caption_examples TEXT NOT NULL,
  reason_for_fit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

GRANT INSERT ON public.va_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.va_applications TO authenticated;
GRANT ALL ON public.va_applications TO service_role;

ALTER TABLE public.va_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a VA application"
  ON public.va_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view VA applications"
  ON public.va_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update VA applications"
  ON public.va_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete VA applications"
  ON public.va_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX va_applications_created_at_idx ON public.va_applications (created_at DESC);
