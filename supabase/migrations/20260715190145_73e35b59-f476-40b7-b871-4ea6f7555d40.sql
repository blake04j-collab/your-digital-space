
DROP FUNCTION IF EXISTS public.list_employees();

CREATE TABLE public.employee_managers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  manager_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX employee_managers_manager_idx ON public.employee_managers(manager_user_id);
GRANT SELECT ON public.employee_managers TO authenticated;
GRANT ALL ON public.employee_managers TO service_role;
ALTER TABLE public.employee_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own mapping" ON public.employee_managers
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers see their team" ON public.employee_managers
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());
CREATE POLICY "Admins see all mappings" ON public.employee_managers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage mappings" ON public.employee_managers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.employee_invite_codes
  ADD COLUMN IF NOT EXISTS manager_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Managers see their own invite codes" ON public.employee_invite_codes;
CREATE POLICY "Managers see their own invite codes" ON public.employee_invite_codes
  FOR SELECT TO authenticated USING (manager_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_my_employee(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.employee_managers WHERE user_id = _user_id AND manager_user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.account_owned_by_my_employee(_account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.x_tracker_accounts a
    JOIN public.employee_managers em ON em.user_id = a.added_by_user_id
    WHERE a.id = _account_id AND em.manager_user_id = auth.uid()
  )
$$;

DROP POLICY IF EXISTS "Managers view team accounts" ON public.x_tracker_accounts;
CREATE POLICY "Managers view team accounts" ON public.x_tracker_accounts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND public.is_my_employee(added_by_user_id));

DROP POLICY IF EXISTS "Managers view team history" ON public.x_tracker_history;
CREATE POLICY "Managers view team history" ON public.x_tracker_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND public.account_owned_by_my_employee(account_id));

DROP POLICY IF EXISTS "Managers view team screenshots" ON public.x_tracker_screenshots;
CREATE POLICY "Managers view team screenshots" ON public.x_tracker_screenshots
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'manager') AND public.account_owned_by_my_employee(account_id));

CREATE OR REPLACE FUNCTION public.redeem_employee_invite(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); mgr uuid; found boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT manager_user_id, true INTO mgr, found
    FROM public.employee_invite_codes WHERE code = _code AND active = true LIMIT 1;
  IF NOT COALESCE(found,false) THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'employee')
    ON CONFLICT (user_id, role) DO NOTHING;
  IF mgr IS NOT NULL THEN
    INSERT INTO public.employee_managers (user_id, manager_user_id) VALUES (uid, mgr)
      ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.create_manager_invite_code(_label text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_code text;
BEGIN
  IF NOT (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin')) THEN
    RAISE EXCEPTION 'not authorized'; END IF;
  LOOP
    new_code := 'CLOUD-' || upper(substr(md5(gen_random_uuid()::text),1,6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.employee_invite_codes WHERE code = new_code);
  END LOOP;
  INSERT INTO public.employee_invite_codes(code, active, manager_user_id, label, created_by)
  VALUES (new_code, true, auth.uid(), _label, auth.uid());
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION public.deactivate_manager_invite_code(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin')) THEN
    RAISE EXCEPTION 'not authorized'; END IF;
  UPDATE public.employee_invite_codes SET active=false
    WHERE code=_code AND (manager_user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.list_my_invite_codes()
RETURNS TABLE(code text, label text, active boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.code, c.label, c.active, c.created_at
    FROM public.employee_invite_codes c
   WHERE c.manager_user_id = auth.uid()
   ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.list_my_employees()
RETURNS TABLE(user_id uuid, email text, account_count bigint, weekly_views bigint, usdt_address text, usdt_network text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id, u.email::text,
    COALESCE(c.cnt,0)::bigint, COALESCE(c.wv,0)::bigint,
    COALESCE(w.usdt_address,'')::text, COALESCE(w.network,'')::text
  FROM public.employee_managers em
  JOIN auth.users u ON u.id = em.user_id
  LEFT JOIN (
    SELECT added_by_user_id, count(*) AS cnt,
           sum(GREATEST(0, current_views - weekly_starting_views)) AS wv
      FROM public.x_tracker_accounts GROUP BY added_by_user_id
  ) c ON c.added_by_user_id = u.id
  LEFT JOIN public.payout_wallets w ON w.user_id = u.id
  WHERE em.manager_user_id = auth.uid() AND public.has_role(auth.uid(),'manager');
$$;

CREATE OR REPLACE FUNCTION public.list_employees()
RETURNS TABLE(user_id uuid, email text, account_count bigint, weekly_views bigint, usdt_address text, usdt_network text, manager_user_id uuid, manager_email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id, u.email::text,
    COALESCE(c.cnt,0)::bigint, COALESCE(c.wv,0)::bigint,
    COALESCE(w.usdt_address,'')::text, COALESCE(w.network,'')::text,
    em.manager_user_id, mu.email::text
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role='employee'
  LEFT JOIN (
    SELECT added_by_user_id, count(*) AS cnt,
           sum(GREATEST(0, current_views - weekly_starting_views)) AS wv
      FROM public.x_tracker_accounts GROUP BY added_by_user_id
  ) c ON c.added_by_user_id = u.id
  LEFT JOIN public.payout_wallets w ON w.user_id = u.id
  LEFT JOIN public.employee_managers em ON em.user_id = u.id
  LEFT JOIN auth.users mu ON mu.id = em.manager_user_id
  WHERE public.has_role(auth.uid(),'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_my_manager_commission()
RETURNS TABLE(lifetime_commission_cents bigint, paid_baseline_cents bigint, unpaid_commission_cents bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); lifetime_pay bigint := 0; baseline bigint := 0; commission bigint;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT COALESCE(SUM((GREATEST(0, current_views - weekly_starting_views) * rate_cents_per_1k)/1000), 0)
    INTO lifetime_pay FROM public.x_tracker_accounts a
   WHERE a.added_by_user_id = uid
      OR a.added_by_user_id IN (SELECT user_id FROM public.employee_managers WHERE manager_user_id = uid);
  lifetime_pay := lifetime_pay + COALESCE((
    SELECT SUM(h.weekly_pay_cents) FROM public.x_tracker_history h
      JOIN public.x_tracker_accounts a ON a.id = h.account_id
     WHERE a.added_by_user_id = uid
        OR a.added_by_user_id IN (SELECT user_id FROM public.employee_managers WHERE manager_user_id = uid)
  ),0);
  commission := ROUND(lifetime_pay * 0.10);
  SELECT COALESCE(b.paid_baseline_cents,0) INTO baseline
    FROM public.x_manager_commission_baseline b WHERE b.user_id = uid;
  RETURN QUERY SELECT commission, baseline, GREATEST(0::bigint, commission - baseline);
END; $$;

CREATE OR REPLACE FUNCTION public.assign_employee_manager(_employee uuid, _manager uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF _manager IS NULL THEN
    DELETE FROM public.employee_managers WHERE user_id = _employee;
  ELSE
    INSERT INTO public.employee_managers (user_id, manager_user_id) VALUES (_employee, _manager)
      ON CONFLICT (user_id) DO UPDATE SET manager_user_id = EXCLUDED.manager_user_id, assigned_at = now();
  END IF;
END; $$;
