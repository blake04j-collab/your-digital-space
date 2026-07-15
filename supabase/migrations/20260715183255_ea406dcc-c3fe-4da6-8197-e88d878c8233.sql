
DROP FUNCTION IF EXISTS public.list_employees();

CREATE OR REPLACE FUNCTION public.redeem_employee_invite(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  ok boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.employee_invite_codes
    WHERE code = _code AND active = true
  ) INTO ok;
  IF NOT ok THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'employee')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_employee_invite(text) TO authenticated;

CREATE FUNCTION public.list_employees()
RETURNS TABLE(user_id uuid, email text, account_count bigint, weekly_views bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email::text,
    COALESCE(c.cnt, 0)::bigint,
    COALESCE(c.wv, 0)::bigint
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'employee'
  LEFT JOIN (
    SELECT added_by_user_id,
           count(*) AS cnt,
           sum(GREATEST(0, current_views - weekly_starting_views)) AS wv
    FROM public.x_tracker_accounts
    GROUP BY added_by_user_id
  ) c ON c.added_by_user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.list_employees() TO authenticated;
