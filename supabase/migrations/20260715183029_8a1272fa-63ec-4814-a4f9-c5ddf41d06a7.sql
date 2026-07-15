
-- Invite codes table
CREATE TABLE IF NOT EXISTS public.employee_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_invite_codes TO authenticated;
GRANT ALL ON public.employee_invite_codes TO service_role;

ALTER TABLE public.employee_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invite codes"
  ON public.employee_invite_codes
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Employee RLS on x_tracker tables
CREATE POLICY "Employees manage own x tracker accounts"
  ON public.x_tracker_accounts
  FOR ALL
  USING (public.has_role(auth.uid(), 'employee'::app_role) AND added_by_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'employee'::app_role) AND added_by_user_id = auth.uid());

CREATE POLICY "Employees read own x tracker history"
  ON public.x_tracker_history
  FOR SELECT
  USING (public.has_role(auth.uid(), 'employee'::app_role) AND added_by_user_id = auth.uid());

CREATE POLICY "Employees manage own x tracker screenshots"
  ON public.x_tracker_screenshots
  FOR ALL
  USING (public.has_role(auth.uid(), 'employee'::app_role) AND added_by_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'employee'::app_role) AND added_by_user_id = auth.uid());

-- Redeem function
CREATE OR REPLACE FUNCTION public.redeem_employee_invite(_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  found BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.employee_invite_codes
    WHERE code = _code AND active = TRUE
  ) INTO found;

  IF NOT found THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'employee'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_employee_invite(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_employee_invite(TEXT) TO authenticated;

-- Admin RPC to list employees
CREATE OR REPLACE FUNCTION public.list_employees()
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text, r.created_at
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'employee'::app_role
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY r.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_employees() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_employees() TO authenticated;

-- Seed one starter invite code
INSERT INTO public.employee_invite_codes (code, label)
VALUES ('CLOUD-' || upper(substr(md5(random()::text), 1, 6)), 'Initial code')
ON CONFLICT (code) DO NOTHING;
