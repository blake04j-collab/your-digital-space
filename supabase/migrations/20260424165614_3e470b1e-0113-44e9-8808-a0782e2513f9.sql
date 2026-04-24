
-- Add ref_code to applications for attribution
ALTER TABLE public.applications ADD COLUMN ref_code text;
CREATE INDEX idx_applications_ref_code ON public.applications(ref_code);

-- Tracking links table
CREATE TABLE public.tracking_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  destination text,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracking_links_code ON public.tracking_links(code);

ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view tracking links"
  ON public.tracking_links FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tracking links"
  ON public.tracking_links FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tracking links"
  ON public.tracking_links FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tracking links"
  ON public.tracking_links FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Link clicks table
CREATE TABLE public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  referrer text,
  user_agent text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_link_clicks_code ON public.link_clicks(code);
CREATE INDEX idx_link_clicks_created_at ON public.link_clicks(created_at DESC);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a click"
  ON public.link_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(code) >= 1 AND char_length(code) <= 100
    AND (referrer IS NULL OR char_length(referrer) <= 2000)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

CREATE POLICY "Admins can view all clicks"
  ON public.link_clicks FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete clicks"
  ON public.link_clicks FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
