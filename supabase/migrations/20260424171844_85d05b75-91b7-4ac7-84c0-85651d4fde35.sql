-- Track raw page views for site-wide analytics
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(path) >= 1 AND char_length(path) <= 500
    AND (referrer IS NULL OR char_length(referrer) <= 2000)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page views"
  ON public.page_views FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));