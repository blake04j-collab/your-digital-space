
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS onlyfans text,
  ADD COLUMN IF NOT EXISTS x_handle text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Replace insert policy to accept the new fields & wider notes
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
CREATE POLICY "Anyone can submit an application"
ON public.applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(fname) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (bio IS NULL OR char_length(bio) <= 2000)
  AND (notes IS NULL OR char_length(notes) <= 5000)
  AND (onlyfans IS NULL OR char_length(onlyfans) <= 500)
  AND (x_handle IS NULL OR char_length(x_handle) <= 100)
  AND (instagram IS NULL OR char_length(instagram) <= 100)
  AND (tiktok IS NULL OR char_length(tiktok) <= 100)
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND status IN ('new','contacted','qualified','rejected')
);

-- Allow admins to update (status changes etc.)
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
