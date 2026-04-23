CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fname TEXT NOT NULL,
  lname TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  tiktok TEXT,
  instagram TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  ig_followers INTEGER DEFAULT 0,
  niche TEXT,
  bio TEXT,
  plan TEXT NOT NULL DEFAULT 'partner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(fname) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (bio IS NULL OR char_length(bio) <= 2000)
    AND plan IN ('free','partner')
  );